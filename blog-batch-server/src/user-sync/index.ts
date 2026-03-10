import { PrismaClient } from '@prisma/client';

const BATCH_NAME = 'user-sync';

interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdTimestamp: number;
}

async function getAdminToken(): Promise<string> {
  const url = `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: process.env.KEYCLOAK_ADMIN_USERNAME!,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD!,
    }),
  });
  if (!res.ok) throw new Error(`Failed to get Keycloak token: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function fetchKeycloakUsers(token: string): Promise<KeycloakUser[]> {
  const users: KeycloakUser[] = [];
  const pageSize = 100;
  let offset = 0;

  while (true) {
    const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?first=${offset}&max=${pageSize}&briefRepresentation=false`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Failed to fetch Keycloak users: ${res.status}`);

    const page = await res.json() as KeycloakUser[];
    users.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return users;
}

async function userSync(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    // 最終同期時刻を取得
    const syncLog = await prisma.batchSyncLog.findUnique({ where: { batchName: BATCH_NAME } });
    const lastSyncAt = syncLog?.lastSyncAt ?? new Date(0);
    console.log(`[user-sync] Last sync: ${lastSyncAt.toISOString()}`);

    // Keycloak からユーザー一覧を取得
    const token = await getAdminToken();
    const keycloakUsers = await fetchKeycloakUsers(token);
    console.log(`[user-sync] Fetched ${keycloakUsers.length} users from Keycloak`);

    let inserted = 0, updated = 0, skipped = 0;

    for (const kcUser of keycloakUsers) {
      const firstName = kcUser.firstName ?? '';
      const lastName = kcUser.lastName ?? '';

      const existing = await prisma.user.findUnique({ where: { keycloakId: kcUser.id } });

      if (!existing) {
        // 新規ユーザー: INSERT（ブログ独自フィールドはデフォルト値）
        await prisma.user.create({
          data: {
            keycloakId: kcUser.id,
            username:   kcUser.username,
            email:      kcUser.email,
            firstName,
            lastName,
            role: 'USER',
          },
        });
        inserted++;
      } else {
        // 既存ユーザー: Keycloak管理フィールドのみ差分更新
        // displayName / bio / profileImageUrl / isPublic / role は上書きしない
        const changed =
          existing.username  !== kcUser.username ||
          existing.email     !== kcUser.email    ||
          existing.firstName !== firstName       ||
          existing.lastName  !== lastName;

        if (changed) {
          await prisma.user.update({
            where: { keycloakId: kcUser.id },
            data: { username: kcUser.username, email: kcUser.email, firstName, lastName },
          });
          updated++;
        } else {
          skipped++;
        }
      }
    }

    // 同期ログ更新
    await prisma.batchSyncLog.upsert({
      where:  { batchName: BATCH_NAME },
      create: { batchName: BATCH_NAME, lastSyncAt: new Date() },
      update: { lastSyncAt: new Date() },
    });

    console.log(`[user-sync] Done: inserted=${inserted}, updated=${updated}, skipped=${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

export function startCron(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cron = require('node-cron');
  cron.schedule('0 0,12 * * *', async () => {
    console.log(`[user-sync] Scheduled run started at ${new Date().toISOString()}`);
    try {
      await userSync();
      console.log('[user-sync] Completed');
    } catch (err) {
      console.error('[user-sync] Failed:', err);
    }
  });
  console.log('[user-sync] Scheduled: 00:00 and 12:00');
}

// Lambda ハンドラー（本番用）
export const handler = async (): Promise<void> => {
  console.log('[lambda] user-sync started');
  await userSync();
  console.log('[lambda] user-sync completed');
};

// 単体実行用
if (require.main === module) {
  startCron();
}
