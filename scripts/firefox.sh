#!/usr/bin/env bash
addoneid=$1

#
oldstr='"background":{"service_worker":"background.js"}'
path=$(cd `dirname $0`; pwd)
rootPath=$(cd $path/..; pwd)
filePath=$rootPath"/dist/manifest.json"
newstr='"background":{"scripts":["background.js"],"persistent":true},"browser_specific_settings":{"gecko":{"id":"'$addoneid'@hocgin.top","strict_min_version":"42.0"}}'

echo "s/$oldstr/$newstr/g"

#sed -i "s/$oldstr/$newstr/g" $filePath
sed -i "" "s/$oldstr/$newstr/g" $filePath
