# travis
CUR_COMMIT_MSG=`git log --pretty='%s' -1`
BRANCH_NAME=$TRAVIS_BRANCH CUR_COMMIT_MSG=$CUR_COMMIT_MSG node ./travis/valid/valid_commit.js
TAG_NAME=$CUR_COMMIT_MSG npm run build_all
