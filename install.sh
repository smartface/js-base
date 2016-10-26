npm test
rm -rf ../scripts/libs/js-base/

mkdir -p ../scripts/libs/js-base/ 2>> /dev/null
mkdir -p ../scripts/libs/js-base/vendors/rx 2>> /dev/null
mkdir -p ../scripts/libs/js-base/vendors/rx/dist 2>> /dev/null

mkdir -p ../scripts/libs/js-base/vendors/jasmine-reporters 2>> /dev/null
mkdir -p ../scripts/libs/js-base/vendors/jasmine-reporters/src 2>> /dev/null
mkdir -p ../scripts/libs/js-base/vendors/babel-polyfill 2>> /dev/null

cp -rf ./node_modules/jasmine-reporters/src ../scripts/libs/js-base/vendors/jasmine-reporters
cp -rf ./node_modules/jasmine-reporters/index.js ../scripts/libs/js-base/vendors/jasmine-reporters
cp -rf ./node_modules/jasmine ../scripts/libs/js-base/vendors/
cp -rf ./node_modules/babel-polyfill/dist ../scripts/libs/js-base/vendors/babel-polyfill

folders=`find ./src -mindepth 1 -type d -exec basename {} \;`
for folder in $folders
do
    # mkdir -p "../scripts/libs/js-base/$file"
    cp -rf "./src/$folder" "../scripts/libs/js-base/"
done

cp -rf ./src/index.dev.js ../scripts/libs/js-base/index.js

node_modules="./node_modules"
rx="$node_modules/rx";
rx_files=`sed -rn 's/(.*require\(.*\.(\/.*).\);?)+/\2/p'  <$rx/index.js`
rx_files="/index $rx_files"

for file in $rx_files
do
    # echo "$rx$file.js"
    copy="$(cp -rf "$rx$file.js" ../scripts/libs/js-base/vendors/rx$file.js)"
    $copy
done
# echo "$str"

# cp "./node_modules/rx/" 
echo "=============> JsBase installation"
echo "=============> Completed!"