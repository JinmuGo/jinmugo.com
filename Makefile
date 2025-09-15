all: build
.PHONY: all

dev: install
	pnpm dev
.PHONY: dev

build: install
	pnpm build
.PHONY: build

install:
	pnpm install
.PHONY: install

fclean:
	find . -name "node_modules" -type d -exec rm -rf {} +
.PHONY: fclean

lint:
	pnpm lint
.PHONY: lint

lint-fix:
	pnpm lint:fix
.PHONY: lint-fix

format:
	pnpm format
.PHONY: format

migrate-published:
	cd api && pnpm run migrate:published
.PHONY: migrate-published