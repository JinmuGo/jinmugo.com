# @jinmu/tsconfig

jinmu.me 프로젝트의 공유 TypeScript 설정

## 사용 가능한 설정

### `base.json`

모든 프로젝트에서 공통으로 사용하는 기본 strict 설정입니다.

```json
{
  "extends": "@jinmu/tsconfig/base.json"
}
```

**포함 사항:**
- Strict 모드 활성화
- ESM interop 지원
- Declaration 파일 생성
- Source map 생성
- Type checking 최적화

### `node.json`

Node.js 프로젝트용 설정입니다 (API 서버 등).

```json
{
  "extends": "@jinmu/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**특징:**
- `base.json` 확장
- `target`: ES2022
- `module`: NodeNext
- `moduleResolution`: NodeNext

**사용 예:** `apps/api/tsconfig.json`

### `astro.json` (예정)

Astro 프로젝트용 설정입니다. 현재 블로그는 Astro의 기본 설정을 확장하므로 별도 파일이 없습니다.

## 사용법

### API 프로젝트에서 사용

```json
{
  "extends": "@jinmu/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@jinmu/types": ["../../packages/types/src"],
      "@jinmu/utils": ["../../packages/utils/src"]
    }
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../packages/types" },
    { "path": "../../packages/utils" }
  ]
}
```

### 블로그 프로젝트에서 사용

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "paths": {
      "@/*": ["./src/*"],
      "@jinmu/types": ["../../packages/types/src"]
    }
  },
  "references": [
    { "path": "../../packages/types" }
  ]
}
```

## TypeScript Project References

이 설정들은 TypeScript의 Project References 기능과 함께 사용됩니다:

1. **점진적 빌드**: 변경된 프로젝트만 다시 빌드
2. **타입 안전성**: 패키지 간 타입 체크 강화
3. **IDE 지원**: 더 나은 IntelliSense와 자동완성

### 의존성 계층

```
@jinmu/tsconfig (설정만, 의존성 없음)
    ↓
@jinmu/types (tsconfig/base.json 사용)
    ↓
@jinmu/utils (types에 의존)
    ↓
apps/api, apps/blog (types와 utils 사용)
```

## 설정 파일 구조

```
packages/tsconfig/
├── base.json      # 공통 설정
├── node.json      # Node.js용 (API)
├── package.json
└── README.md
```

## 개발

이 패키지는 설정 파일만 포함하므로 별도 빌드가 필요하지 않습니다.

## 라이선스

MIT
