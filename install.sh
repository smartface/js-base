echo "=============> JsBase installation"
npm test

rm -rf ../scripts/node_modules/{js-base,rx,jasmine-reporters,babel-polyfill}

mkdir -p ../scripts/node_modules/js-base/ 2>> /dev/null
mkdir -p ../scripts/node_modules/rx/dist 2>> /dev/null

# mkdir -p ../scripts/node_modules/jasmine-reporters 2>> /dev/null
mkdir -p ../scripts/node_modules/jasmine-reporters/src 2>> /dev/null
mkdir -p ../scripts/node_modules/babel-polyfill 2>> /dev/null

cp -rf ./node_modules/jasmine-reporters/src ../scripts/node_modules/jasmine-reporters
cp -rf ./node_modules/jasmine-reporters/index.js ../scripts/node_modules/jasmine-reporters
# cp -rf ./node_modules/jasmine ../scripts/node_modules/js-base/vendors/
cp -rf ./node_modules/babel-polyfill/dist ../scripts/node_modules/babel-polyfill
cp -rf ./node_modules/babel-polyfill/package.json ../scripts/node_modules/babel-polyfill/
cp -rf ./package.json ../scripts/package.json
cp -rf ./node_modules/rx/package.json ../scripts/node_modules/rx/package.json

folders=`find ./src -mindepth 1 -type d -exec basename {} \;`
for folder in $folders
do
    # mkdir -p "../scripts/libs/js-base/$file"
    cp -rf "./src/$folder" "../scripts/node_modules/js-base/"
done

node_modules="./node_modules"
rx="$node_modules/rx";
rx_files=`sed -rn 's/(.*require\(.*\.(\/.*).\);?)+/\2/p'  <$rx/index.js`
rx_files="/index $rx_files"

for file in $rx_files
do
    # echo "$rx$file.js"
    copy="$(cp -rf "$rx$file.js" ../scripts/node_modules/rx$file.js)"
    $copy
done
# echo "$str"

# cp "./node_modules/rx/" 
echo "=============> Completed!"