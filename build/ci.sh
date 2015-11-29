#!/bin/bash
set -e

if [ "${TRAVIS_PULL_REQUEST}" == 'false' ]; then
    npm run build
    npm run lint
    npm run cover
    cat ./coverage/lcov.info | ./node_modules/.bin/codecov
else
    npm test
fi
