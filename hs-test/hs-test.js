var spawnSync = require('child_process').spawnSync;
var ls;
//var opts = {
//    stdio: 'inherit'
//};
var opts = {
    encoding: 'utf8'
};
ls = spawnSync('node', ['..\\hidescript\\hidescript.js', 'Test\\fib.hs'], opts);
process.exit(0);
//# sourceMappingURL=hs-test.js.map