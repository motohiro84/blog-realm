#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/7] フロントエンド停止 ==="
docker compose -f "$ROOT/blog-public-client/docker-compose.yml" down
docker compose -f "$ROOT/blog-admin-client/docker-compose.yml" down

echo ""
echo "=== [2/7] バックエンドサーバ停止 ==="
docker compose -f "$ROOT/blog-public-server/docker-compose.yml" down
docker compose -f "$ROOT/blog-admin-server/docker-compose.yml" down

echo ""
echo "=== [3/7] Keycloak 停止 ==="
docker compose -f "$ROOT/auth-service/docker-compose.yml" down

echo ""
echo "=== [4/7] Elasticsearch 停止 ==="
docker compose -f "$ROOT/elasticsearch/docker-compose.yml" down

echo ""
echo "=== [5/7] SeaweedFS 停止 ==="
docker compose -f "$ROOT/seaweedfs-storage/docker-compose.yml" down

echo ""
echo "=== [6/7] PostgreSQL 停止 ==="
docker compose -f "$ROOT/blog-postgres-migration/docker-compose.yml" down

echo ""
echo "=== [7/7] MySQL 停止 ==="
docker compose -f "$ROOT/keycloak-mysql-migration/docker-compose.yml" down

echo ""
echo "=== 停止完了 ==="
