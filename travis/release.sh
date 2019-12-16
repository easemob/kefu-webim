set -ev
BRANCH_NAME=`cat ./release_branch` COMMIT_MESSAGE=`git log --pretty="%s" -30` node ./travis/valid/release.js $*
