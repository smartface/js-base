npm test
rm -rf ../scripts/libs/js-base/

mkdir ../scripts/libs/js-base/ 2>> /dev/null
mkdir ../scripts/libs/js-base/rx 2>> /dev/null
mkdir ../scripts/libs/js-base/rx/dist 2>> /dev/null

folders=`find ./src -mindepth 1 -type d -exec basename {} \;`
for folder in $folders
do
    # mkdir -p "../scripts/libs/js-base/$file"
    cp -rf "./src/$folder" "../scripts/libs/js-base/"
done

cp -rf ./src/index.template.js ../scripts/libs/js-base/index.js

node_modules="./node_modules"
rx="$node_modules/rx";
rx_files=`sed -rn 's/(.*require\(.*\.(\/.*).\);?)+/\2/p'  <$rx/index.js`
rx_files="/index $rx_files"

for file in $rx_files
do
    # echo "$rx$file.js"
    copy="$(cp -rf "$rx$file.js" ../scripts/libs/js-base/rx$file.js)"
    $copy
done
# echo "$str"

# cp "./node_modules/rx/" 
echo "=============> JsBase installation"
echo "=============> Completed!"