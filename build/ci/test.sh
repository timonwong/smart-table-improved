#!/bin/bash
set -e

if [[ "${TRAVIS_PULL_REQUEST}" == 'false' || -z "${CI_PULL_REQUEST}" ]]; then
    npm run build
    npm run lint
    npm run cover
    if [[ "${CODECOV_UPLOAD}" == "true" ]]; then
        echo "Uploading coverage reports to codecov.io ..."
        ./node_modules/.bin/codecov < ./coverage/lcov.info
    fi
else
    npm test
fi
