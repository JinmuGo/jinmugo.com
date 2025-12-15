#!/bin/bash

# Firestore API 활성화 스크립트
# 사용법: ./scripts/enable-firestore-api.sh [PROJECT_ID]

set -e

PROJECT_ID="${1:-${FIREBASE_PROJECT_ID:-blog-project}}"

echo "=========================================="
echo "Enabling Firestore API for project: $PROJECT_ID"
echo "=========================================="
echo ""

# Firestore API 활성화
echo "1. Enabling Cloud Firestore API..."
gcloud services enable firestore.googleapis.com --project="$PROJECT_ID"

echo ""
echo "✓ Firestore API enabled successfully!"
echo ""
echo "Next steps:"
echo "1. Create a Firestore database:"
echo "   https://console.cloud.google.com/firestore?project=$PROJECT_ID"
echo ""
echo "2. Wait a few minutes for the API to propagate"
echo ""
echo "3. Run the migration again:"
echo "   pnpm migrate:firestore"


