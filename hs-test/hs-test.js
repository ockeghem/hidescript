var compiler = '..\\hidescript\\hidescript.js';
// var src = '..\\hs-test\\Test\\func-param-error-001.hs';
var src = '..\\hs-test\\Test\\fib.hs';
var spawnSync = require('child_process').spawnSync;
var fs = require("fs");
var data = '';
try {
    data = fs.readFileSync(src, 'utf-8');
}
catch (err) {
    console.error(err);
    process.exit(1);
}
var re1 = new RegExp("//message=(.*)");
var re2 = new RegExp("//return=(.*)");
var re3 = new RegExp("//filecheck=(.*)");
var reResult1 = re1.exec(data);
var reResult2 = re2.exec(data);
var reResult3 = re3.exec(data);
var message = "";
if (reResult1) {
    message = reResult1[1];
}
var cmdstatus = null;
if (reResult2) {
    cmdstatus = parseInt(reResult2[1], 10);
}
var filecheck = "";
if (reResult3) {
    filecheck = reResult3[1];
}
console.log(data);
var opts = {
    encoding: 'utf8'
};
var out = spawnSync('node', [compiler, src], opts);
var x = out.stdout.indexOf("\n");
var mes = out.stdout.substring(0, x);
process.exit(0);
//# sourceMappingURL=hs-test.js.map