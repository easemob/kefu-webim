set -ev
TAG_NAME=`git log --pretty='%s' -1`
echo git tag: $TAG_NAME
echo nexus_user: ${nexus_user}
echo nexus_password: ${nexus_password}

ls
cd ../
ls
zip -q -r kefu-webim-${TAG_NAME}.zip kefu-webim -x "kefu-webim/node_modules/*" -x kefu-webim/appPageCached.js
curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.product -F a=kefu-webim -F v=${TAG_NAME} -F p=zip -F file=@${TRAVIS_BUILD_DIR}/../kefu-webim-${TAG_NAME}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content
