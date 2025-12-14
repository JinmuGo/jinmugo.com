# Terraform 설정 가이드

이 디렉토리는 GCP 프로젝트의 Firebase/Identity Platform 리소스를 Terraform으로 관리합니다.

## 사전 요구사항

### 1. 필요한 API 활성화

다음 API들이 프로젝트에서 활성화되어 있어야 합니다:
- `identitytoolkit.googleapis.com` (Identity Platform)
- `firebaserules.googleapis.com` (Firebase Rules)

#### API 활성화 방법

**옵션 1: GCP Console (권장)**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `blog-project`
3. [API 및 서비스 > 라이브러리](https://console.cloud.google.com/apis/library?project=blog-project)로 이동
4. 다음 API들을 검색하여 활성화:
   - [Identity Toolkit API](https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=blog-project)
   - [Firebase Rules API](https://console.developers.google.com/apis/api/firebaserules.googleapis.com/overview?project=blog-project)

**옵션 2: gcloud CLI (권한 필요)**
```bash
gcloud services enable identitytoolkit.googleapis.com --project=blog-project
gcloud services enable firebaserules.googleapis.com --project=blog-project
```

**권한 오류가 발생하는 경우:**
- 현재 계정에 `roles/serviceusage.serviceUsageAdmin` 권한이 필요합니다
- 프로젝트 소유자에게 다음 중 하나를 요청하세요:
  1. `Service Usage Admin` 역할 부여
  2. 또는 GCP Console에서 직접 API 활성화 요청

### 2. Terraform 인증 설정

Terraform이 GCP에 접근할 수 있도록 인증을 설정해야 합니다.

**방법 1: Application Default Credentials (ADC) - 권장**
```bash
gcloud auth application-default login
```
현재 사용자 계정으로 인증합니다. 개발 환경에 적합합니다.

**방법 2: Service Account 키 파일 (환경변수)**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```
예: `export GOOGLE_APPLICATION_CREDENTIALS="../api/service-account-key.json"`

**방법 3: Provider 블록에서 직접 지정 (선택적)**
`main.tf`의 provider 블록에서 주석을 해제하고 경로를 지정:
```hcl
provider "google" {
  project = var.project_id
  region  = var.region
  credentials = file("${path.module}/../api/service-account-key.json")
}
```

**주의사항:**
- Service Account 키 파일은 절대 `terraform.tfvars`에 포함하지 마세요
- Service Account 키 파일은 `.gitignore`에 포함되어 있어야 합니다
- 프로덕션 환경에서는 Workload Identity나 Service Account Impersonation 사용을 권장합니다

### 3. Service Account 권한 설정

Terraform에서 리소스를 생성하려면 Service Account에 다음 권한이 필요합니다:

**필요한 IAM 역할:**
- `roles/identityplatform.admin` - Identity Platform 설정 관리
- `roles/firebaserules.admin` - Firebase Rules 관리
- 또는 `roles/firebase.admin` - Firebase 전체 관리 (위 두 역할 포함)

**권한 부여 방법:**

**방법 1: gcloud CLI (프로젝트 소유자 권한 필요)**
```bash
# Service Account 이메일 확인 (api/service-account-key.json의 client_email)
SERVICE_ACCOUNT="api-server@adept-depth-310523.iam.gserviceaccount.com"
PROJECT_ID="blog-project"

# Identity Platform Admin 역할 부여
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/identityplatform.admin"

# Firebase Rules Admin 역할 부여
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/firebaserules.admin"
```

**방법 2: GCP Console**
1. [IAM & Admin > IAM](https://console.cloud.google.com/iam-admin/iam?project=blog-project)로 이동
2. Service Account 찾기: `api-server@adept-depth-310523.iam.gserviceaccount.com`
3. "역할 편집" 클릭
4. 다음 역할 추가:
   - `Identity Platform Admin`
   - `Firebase Rules Admin`
5. 저장

**참고:**
- 프로젝트 소유자가 아닌 경우, 소유자에게 위 역할 부여를 요청하세요
- 또는 `roles/firebase.admin` 역할 하나만 부여해도 됩니다 (더 넓은 권한)

## 사용 방법

### 1. 변수 설정

`terraform.tfvars` 파일을 생성하거나 수정:

```hcl
project_id  = "blog-project"
region      = "asia-northeast3"
database_id = "(default)"  # 또는 다른 데이터베이스 ID
```

### 2. Terraform 초기화

```bash
terraform init
```

### 3. 실행 계획 확인

```bash
terraform plan
```

### 4. 리소스 생성

```bash
terraform apply
```

### 5. 리소스 삭제

```bash
terraform destroy
```

## 생성되는 리소스

1. **Identity Platform 설정**
   - 익명 로그인 활성화
   - `google_identity_platform_config.default`

2. **Firestore 보안 규칙**
   - Ruleset: `google_firebaserules_ruleset.firestore_rules`
   - Release: `google_firebaserules_release.release`
   - 규칙 내용:
     - `post_stats/{slug}`: 모든 사용자 읽기 가능, 인증된 사용자만 쓰기 가능

## 문제 해결

### API 활성화 권한 오류

**에러:**
```
Error 403: Permission denied to enable service
```

**해결 방법:**
1. GCP Console에서 수동으로 API 활성화
2. 프로젝트 소유자에게 `roles/serviceusage.serviceUsageAdmin` 권한 요청

### Identity Platform 결제 계정 오류

**에러:**
```
Error 400: BILLING_NOT_ENABLED : Identity Platform feature requires billing to be enabled.
```

**해결 방법:**
1. **결제 계정 연결 (필수)**
   - [GCP Console > Billing](https://console.cloud.google.com/billing?project=adept-depth-310523)로 이동
   - 프로젝트에 결제 계정 연결
   - 또는 gcloud CLI:
     ```bash
     gcloud billing projects link adept-depth-310523 --billing-account=BILLING_ACCOUNT_ID
     ```

2. **Identity Platform 리소스 활성화**
   - 결제 계정 연결 후 `main.tf`에서 Identity Platform 리소스 주석 해제

**참고:**
- Identity Platform은 무료 할당량이 있지만 결제 계정 연결이 필요합니다
- 결제 계정이 없으면 Identity Platform 리소스를 주석 처리하고 Firebase Rules만 사용할 수 있습니다

### Firestore Rules 배포 오류

**에러:**
```
Error: Error creating FirebaserulesRelease
```

**해결 방법:**
- Firebase Rules API가 활성화되어 있는지 확인
- Firestore 데이터베이스가 생성되어 있는지 확인

### Service Account 권한 오류

**에러:**
```
Error 403: The caller does not have permission
```

**해결 방법:**
1. Service Account에 필요한 역할이 부여되어 있는지 확인:
   - `roles/identityplatform.admin` (Identity Platform 설정용)
   - `roles/firebaserules.admin` (Firebase Rules 관리용)
   
2. 권한 부여 (프로젝트 소유자 권한 필요):
   ```bash
   SERVICE_ACCOUNT="api-server@adept-depth-310523.iam.gserviceaccount.com"
   PROJECT_ID="blog-project"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/identityplatform.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/firebaserules.admin"
   ```

3. 또는 `roles/firebase.admin` 역할 하나만 부여 (더 넓은 권한):
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/firebase.admin"
   ```

## 참고 자료

- [Terraform Google Provider 문서](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Firebase Security Rules 문서](https://firebase.google.com/docs/firestore/security/get-started)
- [Identity Platform 문서](https://cloud.google.com/identity-platform/docs)
