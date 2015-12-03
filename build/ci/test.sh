#!/bin/bash
set -e

if [ "${TRAVIS_PULL_REQUEST}" == 'false' || -z "${CI_PULL_REQUEST}"]; then
    npm run build
    npm run lint
    npm run cover
    cat ./coverage/lcov.info | ./node_modules/.bin/codecov
else
    npm test
fi
