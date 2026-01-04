#!/bin/bash

# Terraform Service Account 권한 부여 스크립트
# 사용법: ./grant-permissions.sh [PROJECT_ID]

set -e

# Service Account 이메일 (api/service-account-key.json에서 확인)
SERVICE_ACCOUNT="api-server@adept-depth-310523.iam.gserviceaccount.com"

# 프로젝트 ID (기본값: blog-project)
PROJECT_ID="${1:-blog-project}"

echo "=========================================="
echo "Granting Terraform permissions"
echo "=========================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""

# 현재 사용자 확인
CURRENT_USER=$(gcloud config get-value account 2>/dev/null || echo "unknown")
echo "Current user: $CURRENT_USER"
echo ""

# 권한 부여 확인
read -p "Do you want to grant the following roles to $SERVICE_ACCOUNT? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Granting roles..."

# Identity Platform Admin 역할 부여
echo "1. Granting roles/identityplatform.admin..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/identityplatform.admin" \
  --condition=None || {
    echo "⚠️  Failed to grant roles/identityplatform.admin"
    echo "   You may need to be a project owner or have IAM Admin permissions"
    exit 1
  }

# Firebase Rules Admin 역할 부여
echo "2. Granting roles/firebaserules.admin..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/firebaserules.admin" \
  --condition=None || {
    echo "⚠️  Failed to grant roles/firebaserules.admin"
    echo "   You may need to be a project owner or have IAM Admin permissions"
    exit 1
  }

echo ""
echo "✅ Permissions granted successfully!"
echo ""
echo "You can now run: terraform apply"

















