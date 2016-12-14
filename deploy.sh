TAG_NAME=`git tag --contains`
zip -r rs-${TAG_NAME}.zip ./static *.js *.html
# todo 修改打包zip代码
curl -v -F r=releases -F hasPom=false -F e=zip -F g=com.easemob.kefu -F a=kefu-fe-webim -F v=${TAG_NAME} -F p=zip -F file=@rs-${TAG_NAME}.zip -u ci-deploy:Xyc-R5c-SdS-2Qr http://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content

# rm rs-${TAG_NAME}.zip

# curl -v
# 	-F r=snapshots
# 	-F hasPom=false
# 	-F e=zip
# 	-F g=com.easemob.kefu
# 	-F a=kefu-fe-webim
# 	-F v=
# 	-F p=zip
# 	-F file=@dev-.zip
# 	-u ci-deploy:Xyc-R5c-SdS-2Qr http://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content