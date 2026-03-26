# ============================================================
# Makefile: Local Node + npx (no sudo required)
# ============================================================

SHELL := /bin/bash

NODE_VERSION := 20
NVM_VERSION := v0.39.7
NVM_DIR := $(HOME)/.nvm

.PHONY: help install-nvm setup install run clean

help:
	@echo "  make install    -> first time setup (nvm + node + dependencies)"
	@echo "  make run        -> start the app"
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
# First time setup — run this once
# ------------------------------------------------------------
install: install-nvm
	@export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	unset NPM_CONFIG_PREFIX; \
	echo "[INFO] Installing Node $(NODE_VERSION)..."; \
	nvm install $(NODE_VERSION); \
	nvm use $(NODE_VERSION); \
	echo "[INFO] Node: $$(node -v) | npm: $$(npm -v) | npx: $$(npx -v)"; \
	echo "[INFO] Installing dependencies..."; \
	npm install

# ------------------------------------------------------------
# Run the app — lightweight, no reinstalling anything
# ------------------------------------------------------------
run:
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