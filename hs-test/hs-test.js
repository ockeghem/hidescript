var compiler = '..\\hidescript\\hidescript.js';
var testDir = '.\\Test';
var testResult = '.\\TestResult';
var testRef = '.\\TestRef';
var spawnSync = require('child_process').spawnSync;
var fs = require("fs");
var path = require('path');
// テスト結果ディレクトリがなければ作成する
if (!fs.existsSync(testResult)) {
    fs.mkdirSync(testResult);
}
function head(s) {
    var pos = s.indexOf("\n");
    return s.substring(0, pos);
}
function getProperty(keyword, data) {
    var re = new RegExp("//" + keyword + "=(.*)");
    var result = re.exec(data);
    if (result) {
        return result[1];
    }
    return null;
}
function getTestConditions(srcfile) {
    var data = '';
    try {
        data = fs.readFileSync(srcfile, 'utf-8');
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
    var keys = ['message', 'status', 'diff'];
    var props = new Array();
    keys.forEach(function (key) {
        var result = getProperty(key, data);
        props[key] = result;
    });
    return props;
}
function testScript(srcfile) {
    var opts = {
        encoding: 'utf8'
    };
    return spawnSync('node', [compiler, srcfile], opts);
}
function getOutFile(srcfile) {
    var ext = path.extname(srcfile);
    var fname = path.basename(srcfile, ext);
    var outfile = path.format({ dir: path.dirname(srcfile), name: fname, ext: ".mac" }); // 出力ファイルの組み立て
    return outfile;
}
function diffFile(src1, src2) {
    var data1 = '';
    var data2 = '';
    var status = 0;
    try {
        status = -1;
        data1 = fs.readFileSync(getOutFile(src1), 'utf-8');
        status = -2;
        data2 = fs.readFileSync(getOutFile(src2), 'utf-8');
    }
    catch (err) {
        // console.error(err);
        return status;
    }
    return (data1 == data2) ? 1 : 0;
}
var files = fs.readdirSync(testDir);
files.filter(function (file) {
    return /.*\.hst/.test(file);
}).forEach(function (file) {
    var path = testDir + "\\" + file;
    var cond = getTestConditions(path);
    var result = testScript(path);
    var checked = false;
    var ok = true;
    var s_result = "";
    if (cond['diff']) {
        var r_diff = diffFile(testResult + "\\" + file, testRef + "\\" + file);
        // diffの実行
        checked = true;
        switch (r_diff) {
            case 1:
                s_result += "o";
                break;
            case 0:
                ok = false;
                s_result += "x";
                break;
            case -1:
                ok = false;
                s_result += "a";
                break;
            case -2:
                ok = false;
                s_result += "b";
                break;
            default:
                console.log("Cannot happen");
                process.exit(1);
        }
    }
    else {
        s_result += "-";
    }
    if (cond['status'] !== null) {
        console.log(cond['status'] == result['status']);
        checked = true;
        if (cond['status'] == result['status']) {
            s_result += "o";
        }
        else {
            s_result += "x";
            ok = false;
        }
    }
    else {
        s_result += "-";
    }
    if (cond['message'] !== null) {
        // console.log(cond['message'] == head(result['stdout']));
        if (cond['message'] == head(result['stdout'])) {
            s_result += "o";
        }
        else {
            s_result += "x";
            ok = false;
        }
        checked = true;
    }
    else {
        s_result += "-";
    }
    console.log("s_result : " + s_result);
});
process.exit(0);
//# sourceMappingURL=hs-test.js.map