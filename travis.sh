echo git tag: $TRAVIS_TAG
echo nexus_user: ${nexus_user}
echo nexus_password: ${nexus_password}

if [ $TRAVIS_TAG ] && [ "$TRAVIS_TAG"x != ""x ]; then

    if [ `echo $TRAVIS_TAG | grep "^plugin_[0-9]\+\.[0-9]\+\.[0-9]\+_final$"` ] || [ `echo $TRAVIS_TAG | grep "^plugin_[0-9]\+\.[0-9]\+\.[0-9]\+_snapshot$"` ]; then

        # nexus
        echo ''
        echo '[is a tag] start packing'
        npm config set registry https://registry.npm.taobao.org

        npm install
        npm run build_all -- --tag-name=$TRAVIS_TAG
        ls
        cd ../
        ls

        zip -q -r kefu-webim-${TRAVIS_TAG}.zip kefu-webim -x "kefu-webim/node_modules/*" -x kefu-webim/appPageCached.js

        if [ `echo $TRAVIS_TAG | grep "^plugin_[0-9]\+\.[0-9]\+\.[0-9]\+_final$"` ];then

            curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.product -F a=kefu-webim -F v=${TRAVIS_TAG} -F p=zip -F file=@${TRAVIS_BUILD_DIR}/../kefu-webim-${TRAVIS_TAG}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content

        else

            curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu.webim.development -F a=kefu-webim -F v=${TRAVIS_TAG} -F p=zip -F file=@${TRAVIS_BUILD_DIR}/../kefu-webim-${TRAVIS_TAG}.zip -u ${nexus_user}:${nexus_password} https://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content

        fi

     else

        echo ''
        echo 'The format of the tag is not correct.'

    fi

else

echo ''
echo '[not a tag] exit packing.'

fi
