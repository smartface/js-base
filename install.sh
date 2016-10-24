npm i
npm test
mkdir ../scripts/libs/js-base/ 2>> /dev/null
mkdir ../scripts/libs/js-base/rx 2>> /dev/null
mkdir ../scripts/libs/js-base/rx/dist 2>> /dev/null

cp -r ./src/* ../scripts/libs/js-base/
node_modules="./node_modules"
rx="$node_modules/rx";
rx_files=`sed -rn 's/(.*require\(.*\.(\/.*).\);?)+/\2/p'  <$rx/index.js`
rx_files="/index $rx_files"

for file in $rx_files
do
    echo "$rx$file.js"
    copy="$(cp -rf "$rx$file.js" ../scripts/libs/js-base/rx$file.js)"
    $copy
done
# echo "$str"

# cp "./node_modules/rx/" 
echo "=============> JsBase installation"
echo "=============> Completed!"

# require('./dist/rx');
# require('./dist/rx.aggregates');
# require('./dist/rx.async');
# require('./dist/rx.backpressure');
# require('./dist/rx.binding');
# require('./dist/rx.coincidence');
# require('./dist/rx.experimental');
# require('./dist/rx.joinpatterns');
# require('./dist/rx.sorting');
# require('./dist/rx.virtualtime');
# require('./dist/rx.testing');
# require('./dist/rx.time');
