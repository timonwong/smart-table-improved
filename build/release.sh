#!/bin/bash
set -e
echo "Enter release version: "
read -r VERSION

read -p "Releasing ${VERSION} - are you sure? (y/n)" -n 1 -r
echo
if [[ "${REPLY}" =~ ^[Yy]$ ]]; then
    echo "Releasing ${VERSION}..."

    # lint
    npm run lint

    # build
    VERSION=${VERSION} npm run build
    git add -A
    git commit -m "[build] ${VERSION}" || :

    # release
    npm version "${VERSION}" --message "[release] ${VERSION}"

    # publish
    git push origin "v${VERSION}"
    git push
    npm publish
fi
