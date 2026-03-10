#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== ネットワーク作成 ==="
docker network create blog-realm-network 2>/dev/null || echo "blog-realm-network は既に存在します"

echo ""
echo "=== [1/8] MySQL (Keycloak DB) 起動 ==="
docker compose -f "$ROOT/keycloak-mysql-migration/docker-compose.yml" up -d
echo "MySQL の起動を待機中..."
until docker exec keycloak-mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
  sleep 2
done
echo "MySQL 起動完了"

echo ""
echo "=== [2/8] PostgreSQL (ブログ DB) 起動 ==="
docker compose -f "$ROOT/blog-postgres-migration/docker-compose.yml" up -d
echo "PostgreSQL の起動を待機中..."
until docker exec blog-postgres pg_isready -U "${BLOG_POSTGRES_USER:-admin}" 2>/dev/null; do
  sleep 2
done
echo "PostgreSQL 起動完了"

echo ""
echo "=== [3/8] SeaweedFS 起動 ==="
docker compose -f "$ROOT/seaweedfs-storage/docker-compose.yml" up -d

echo ""
echo "=== [4/8] Elasticsearch 起動 ==="
docker compose -f "$ROOT/elasticsearch/docker-compose.yml" up -d
echo "Elasticsearch の起動を待機中..."
until curl -s http://localhost:9200/_cluster/health 2>/dev/null | grep -vq '"status":"red"'; do
  sleep 3
done
echo "Elasticsearch 起動完了"

echo ""
echo "=== [5/8] Keycloak 起動 ==="
docker compose -f "$ROOT/auth-service/docker-compose.yml" up -d
echo "Keycloak の起動を待機中 (約30秒)..."
sleep 30
echo "Keycloak 起動完了"

echo ""
echo "=== [6/8] バックエンドサーバ起動 ==="

docker compose -f "$ROOT/blog-admin-server/docker-compose.yml" up -d --build
docker compose -f "$ROOT/blog-public-server/docker-compose.yml" up -d --build

echo ""
echo "=== [7/8] バッチサーバ起動 ==="
docker compose -f "$ROOT/blog-batch-server/docker-compose.yml" up -d --build

echo ""
echo "=== [8/8] フロントエンド起動 ==="
docker compose -f "$ROOT/blog-admin-client/docker-compose.yml" up -d --build
docker compose -f "$ROOT/blog-public-client/docker-compose.yml" up -d --build

echo ""
echo "=== 起動完了 ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
