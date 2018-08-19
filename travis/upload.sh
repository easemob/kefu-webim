set -ev
echo git tag: $TRAVIS_TAG
echo nexus_user: ${nexus_user}
echo nexus_password: ${nexus_password}

ls
cd ../
ls
zip -q -r kefu-webim-${TRAVIS_TAG}.zip kefu-webim -x "kefu-webim/node_modules/*" -x kefu-webim/appPageCached.js
curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.product -F a=kefu-webim -F v=${TRAVIS_TAG} -F p=zip -F file=@${TRAVIS_BUILD_DIR}/../kefu-webim-${TRAVIS_TAG}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content
