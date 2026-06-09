#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts || echo "NVM install failed"
npm install -g netlify-cli || echo "NPM install failed"
