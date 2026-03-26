# ============================================================
# Makefile: Local Node + npx (no sudo required)
#
# This Makefile installs Node.js using nvm (user-space only),
# ensuring compatibility on systems without admin privileges.
#
# It also fixes common issues with NPM_CONFIG_PREFIX interfering
# with nvm, and runs the project using npx.
#
# Usage:
#   make run        # full setup + run app
#   make install    # install dependencies only
#   make clean      # remove node_modules
# ============================================================

SHELL := /bin/bash

# ---- Config ----
NODE_VERSION := 20
NVM_VERSION := v0.39.7
NVM_DIR := $(HOME)/.nvm

# ---- Targets ----
.PHONY: help install-nvm setup install run clean

help:
	@echo "Targets:"
	@echo "  make run        -> full setup + run app"
	@echo "  make install    -> install dependencies"
	@echo "  make clean      -> remove node_modules"

# ------------------------------------------------------------
# Install nvm locally (no admin permissions required)
# ------------------------------------------------------------
install-nvm:
	@if [ ! -d "$(NVM_DIR)" ]; then \
		echo "[INFO] Installing nvm..."; \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/$(NVM_VERSION)/install.sh | bash; \
	else \
		echo "[INFO] nvm already installed"; \
	fi

# ------------------------------------------------------------
# Load nvm + fix environment + install Node
# ------------------------------------------------------------
setup: install-nvm
	@export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	[ -s "$$NVM_DIR/bash_completion" ] && . "$$NVM_DIR/bash_completion"; \
	unset NPM_CONFIG_PREFIX; \
	echo "[INFO] Installing Node $(NODE_VERSION)..."; \
	nvm install $(NODE_VERSION); \
	nvm use $(NODE_VERSION); \
	echo "[INFO] Node version: $$(node -v)"; \
	echo "[INFO] npm version:  $$(npm -v)"; \
	echo "[INFO] npx version:  $$(npx -v)"

# ------------------------------------------------------------
# Install project dependencies
# ------------------------------------------------------------
install: setup
	@export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	unset NPM_CONFIG_PREFIX; \
	nvm use $(NODE_VERSION); \
	echo "[INFO] Installing dependencies..."; \
	npm install

# ------------------------------------------------------------
# Run the app using npx (Expo)
# ------------------------------------------------------------
run: install
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
	rm -rf node_modules