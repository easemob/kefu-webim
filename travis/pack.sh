set -ev
BRANCH_NAME=`cat ./release_branch` COMMIT_MESSAGE=`git log --pretty='%s' -1` node ./travis/valid/valid_commit.js
TAG_NAME=`cat ./release_tag` npm run build_all
