set -ev
echo git tag: $TRAVIS_TAG

echo -e "\n[is a tag] start packing\n"
TAG_NAME=$TRAVIS_TAG npm run build_all
