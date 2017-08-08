var compiler = '..\\hidescript\\hidescript.js';
var hidemarupath = "C:\\Program Files\\Hidemaru\\hidemaru.exe";
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
    var keys = ['message', 'status', 'diff', 'exec'];
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
function changeExt(srcfile, newext) {
    var ext = path.extname(srcfile);
    var fname = path.basename(srcfile, ext);
    var outfile = path.format({ dir: path.dirname(srcfile), name: fname, ext: newext }); // 出力ファイルの組み立て
    return outfile;
}
function diffFile(src1, src2) {
    var data1 = '';
    var data2 = '';
    var status = 0;
    try {
        status = -1;
        data1 = fs.readFileSync(src1, 'utf-8');
        status = -2;
        data2 = fs.readFileSync(src2, 'utf-8');
    }
    catch (err) {
        // console.error(err);
        return status;
    }
    return (data1 == data2) ? 1 : 0;
}
var files = fs.readdirSync(testDir);
files.filter(function (file) {
    return /\.hst$/.test(file);
}).forEach(function (file) {
    var path = testDir + "\\" + file;
    var cond = getTestConditions(path);
    var result = testScript(path);
    var checked = false;
    var ok = true;
    var s_result = "";
    if (cond['diff'] == "1") {
        var r_diff = diffFile(changeExt(testResult + "\\" + file, ".mac"), changeExt(testRef + "\\" + file, ".mac"));
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
    // if (cond['exec'] && cond['status'] == 0) {
    if (result.status == 0) {
        var macrofile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".mac");
        var outfile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".out");
        try {
            fs.unlinkSync(outfile);
        }
        catch (err) {
            var dummy = 1; // デバッグ用ダミー
        }
        var run_result = spawnSync(hidemarupath, ["/x", macrofile, outfile], { encoding: 'utf8' });
        // exec=1 の場合は実行結果のチェック
        if (cond['exec']) {
            /***
                    if (result.status != 0) {
                        ok = false;
                        s_result += "f";
                    } else {
            **/
            /*  http://nodejs.jp/nodejs.org_ja/api/path.html    */
            var r_diff = diffFile(changeExt(testResult + "\\" + file, ".out"), changeExt(testRef + "\\" + file, ".out"));
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
    }
    else {
        s_result += "-";
    }
    var s_ok = ok ? "OK" : "NG";
    console.log(file + "\t" + s_ok + "\t" + s_result);
});
process.exit(0);
//# sourceMappingURL=hs-test.js.map