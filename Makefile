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
	rm -rf node_modules
.PHONY: fclean
