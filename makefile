# ============================================================
# Makefile: Local Node + npx (no sudo required)
# ============================================================

SHELL := /bin/bash

NODE_VERSION := 20
NVM_VERSION := v0.39.7
NVM_DIR := $(HOME)/.nvm

.PHONY: help install-nvm install run clean

help:
	@echo "  make install    -> first time setup (nvm + node + dependencies)"
	@echo "  make run        -> start the app (installs deps if needed)"
	@echo "  make clean      -> remove node_modules"

# ------------------------------------------------------------
# Install nvm locally (skipped if already installed)
# ------------------------------------------------------------
install-nvm:
	@if [ ! -d "$(NVM_DIR)" ]; then \
		echo "[INFO] Installing nvm (tarball method)..."; \
		mkdir -p "$(NVM_DIR)"; \
		curl -fsSL https://github.com/nvm-sh/nvm/archive/refs/tags/$(NVM_VERSION).tar.gz | tar -xz -C "$(NVM_DIR)" --strip-components=1; \
	else \
		echo "[INFO] nvm already installed, skipping"; \
	fi

# ------------------------------------------------------------
# Stamp file — only reinstalls when package.json changes
# ------------------------------------------------------------
node_modules/.install-stamp: package.json package-lock.json
	@export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	unset NPM_CONFIG_PREFIX; \
	if ! nvm ls $(NODE_VERSION) | grep -q "v$(NODE_VERSION)"; then \
		echo "[INFO] Installing Node $(NODE_VERSION)..."; \
		nvm install $(NODE_VERSION); \
	else \
		echo "[INFO] Node $(NODE_VERSION) already installed, skipping"; \
	fi; \
	nvm use $(NODE_VERSION); \
	echo "[INFO] Node: $$(node -v) | npm: $$(npm -v)"; \
	echo "[INFO] Installing dependencies..."; \
	npm ci --prefer-offline; \
	touch node_modules/.install-stamp

# ------------------------------------------------------------
# First time setup
# ------------------------------------------------------------
install: install-nvm node_modules/.install-stamp

# ------------------------------------------------------------
# Run the app — triggers install only if stamp is missing
# ------------------------------------------------------------
run: install-nvm node_modules/.install-stamp
	@export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	unset NPM_CONFIG_PREFIX; \
	nvm use $(NODE_VERSION); \
	echo "[INFO] Starting app..."; \
	npx expo start

# ------------------------------------------------------------
# Clean project
# ------------------------------------------------------------
clean:
	@echo "[INFO] Removing node_modules..."
	@rm -rf node_modules