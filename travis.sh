echo git tag: $TRAVIS_TAG
echo nexus_user: ${nexus_user}
echo nexus_password: ${nexus_password}
IS_FINAL_TAG=`echo $TRAVIS_TAG | grep "^plugin_[0-9]\+\.[0-9]\+\.[0-9]\+_final$"`
IS_SNAPSHOT_TAG=`echo $TRAVIS_TAG | grep "^plugin_[0-9]\+\.[0-9]\+\.[0-9]\+_snapshot$"`

if [ $TRAVIS_TAG ] && [ "$TRAVIS_TAG"x != ""x ]; then
    if [ IS_FINAL_TAG ] || [ IS_SNAPSHOT_TAG ]; then
        # nexus
        echo ''
        echo '[is a tag] start packing'
        npm config set registry https://registry.npm.taobao.org

        npm install
        TRAVIS=true TAG_NAME=$TRAVIS_TAG npm run build:all || exit 1

		# 去除 node_modules、源码、server
        # zip -r ${TRAVIS_TAG}.zip build -x "kefu-webim/.git/*"
        zip -r ${TRAVIS_TAG}.zip build
        if [ IS_FINAL_TAG ]; then
            curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.product -F a=kefu-webim -F v=${TRAVIS_TAG} -F p=zip -F file=@${TRAVIS_TAG}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content
        else
            curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.development -F a=kefu-webim -F v=${TRAVIS_TAG} -F p=zip -F file=@${TRAVIS_TAG}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content
        fi
    else
        echo ''
        echo 'The format of the tag is not correct.'
    fi
else
	echo ''
	echo '[not a tag] exit packing.'
fi
