set -ev
# local
RECENTLY_COMMIT_MESSAGES=`git log --pretty="%s" -30`
BRANCH_NAME=`git rev-parse --abbrev-ref HEAD`
BRANCH_NAME=$BRANCH_NAME RECENTLY_COMMIT_MESSAGES=$RECENTLY_COMMIT_MESSAGES node ./travis/valid/release.js $*
