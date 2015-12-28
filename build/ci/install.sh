#!/bin/bash
set -e

# Check the size of caches
du -sh ./node_modules || true
# Disable the spinner, it looks bad on Travis
npm config set spin false
# Log HTTP requests
npm config set loglevel http
npm install -g npm@2.5
# Instal npm dependecies and ensure that npm cache is not stale
npm install

# Install online reporter tools for code coverage on demand
if [[ -n "${CODECLIMATE_REPO_TOKEN}" ]]; then
    npm install 'codeclimate-test-reporter'
fi
if [[ "${CODECOV_UPLOAD}" == "true" ]]; then
    npm install 'codecov.io'
fi
