#!/bin/bash

# Firestore API 활성화 권한 확인 스크립트
# 사용법: ./scripts/check-firestore-permissions.sh [PROJECT_ID]

set -e

PROJECT_ID="${1:-${FIREBASE_PROJECT_ID:-blog-project}}"
CURRENT_USER=$(gcloud config get-value account 2>/dev/null || echo "unknown")

echo "=========================================="
echo "Checking Firestore API permissions"
echo "=========================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Current user: $CURRENT_USER"
echo ""

# 현재 사용자의 IAM 역할 확인
echo "Checking IAM roles for current user..."
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$CURRENT_USER" \
  --format="table(bindings.role)" 2>/dev/null || {
  echo "⚠️  Could not retrieve IAM policy. You may not have permission to view it."
  echo ""
  echo "Required roles to enable APIs:"
  echo "  - roles/serviceusage.serviceUsageAdmin (Service Usage Admin)"
  echo "  - OR roles/owner (Owner)"
  echo "  - OR roles/editor (Editor)"
  exit 1
}

echo ""
echo "To enable Firestore API, you need one of these roles:"
echo "  - roles/serviceusage.serviceUsageAdmin"
echo "  - roles/owner"
echo "  - roles/editor"
echo ""
echo "If you don't have these roles, ask the project owner to:"
echo "  1. Grant you the 'Service Usage Admin' role, OR"
echo "  2. Enable Firestore API via GCP Console:"
echo "     https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=$PROJECT_ID"

