TAG_NAME=`git tag --contains`
if [ $TAG_NAME ]; then sh ./deploy.sh; fi