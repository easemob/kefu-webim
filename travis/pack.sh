set -ev
BRANCH_NAME=`cat ./release_branch` TAG_INFO=`git tag --contains` node ./travis/valid/valid.js
npm run build_all
