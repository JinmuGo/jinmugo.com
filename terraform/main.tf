terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  
  # Service Account 키 파일 직접 지정
  # 다른 인증 방법을 사용하려면 이 줄을 주석 처리하고 아래 방법 중 하나를 사용하세요:
  # 1. 환경변수: export GOOGLE_APPLICATION_CREDENTIALS="../api/service-account-key.json"
  # 2. Application Default Credentials: gcloud auth application-default login
  credentials = file("${path.module}/../api/service-account-key.json")
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  
  # Service Account 키 파일 직접 지정
  credentials = file("${path.module}/../api/service-account-key.json")
}

# 1. API 활성화
# 참고: 다음 API들이 프로젝트에서 활성화되어 있어야 합니다:
# - identitytoolkit.googleapis.com (Identity Platform)
# - firebaserules.googleapis.com (Firebase Rules)
# 
# API 활성화 방법:
# 1. GCP Console에서 수동 활성화 (권장):
#    - Identity Toolkit API: https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=${var.project_id}
#    - Firebase Rules API: https://console.developers.google.com/apis/api/firebaserules.googleapis.com/overview?project=${var.project_id}
# 
# 2. gcloud CLI (권한 필요: roles/serviceusage.serviceUsageAdmin):
#    gcloud services enable identitytoolkit.googleapis.com --project=${var.project_id}
#    gcloud services enable firebaserules.googleapis.com --project=${var.project_id}
#
# 참고: API가 이미 활성화되어 있으면 terraform apply가 정상적으로 작동합니다.
# API 활성화 권한이 없는 경우 GCP Console에서 수동으로 활성화하거나 프로젝트 소유자에게 권한을 요청하세요.

# 2. Identity Platform (Auth) - 익명 로그인
# 주의: Identity Platform은 결제 계정이 활성화되어 있어야 합니다.
resource "google_identity_platform_config" "default" {
  provider = google-beta
  project  = var.project_id
  
  sign_in {
    anonymous {
      enabled = true
    }
  }
}

# 3. Firestore Ruleset 정의 (google-beta provider 사용)
resource "google_firebaserules_ruleset" "firestore_rules" {
  provider = google-beta
  project  = var.project_id
  
  source {
    files {
      name    = "firestore.rules"
      content = <<EOT
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /post_stats/{slug} {
      allow get: if true;
      allow write: if request.auth != null;
    }
  }
}
EOT
    }
  }

  # Firebase Rules API가 활성화되어 있어야 하므로, 수동으로 활성화한 후 적용하세요
}

# 4. Ruleset 배포 (Release) - google-beta provider 사용
resource "google_firebaserules_release" "release" {
  provider     = google-beta
  project      = var.project_id
  
  # release 이름은 "cloud.firestore"를 사용 (기본 Firestore 데이터베이스)
  # 또는 특정 데이터베이스의 경우: "projects/{project_id}/databases/{database_id}/releases/cloud.firestore"
  name         = "cloud.firestore"
  
  ruleset_name = google_firebaserules_ruleset.firestore_rules.name
  
  # Firestore Rule Release는 내부적으로 프로젝트와 데이터베이스에 연결됩니다.
  # "name" 필드를 통해 이 관계를 명시합니다.
}
