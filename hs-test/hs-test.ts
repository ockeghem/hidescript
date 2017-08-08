const compiler = '..\\hidescript\\hidescript.js';
const hidemarupath = "C:\\Program Files\\Hidemaru\\hidemaru.exe";
const testDir = '.\\Test';
const testResult = '.\\TestResult';
const testRef = '.\\TestRef';

const spawnSync = require('child_process').spawnSync;
const fs = require("fs");
const path = require('path');

// テスト結果ディレクトリがなければ作成する
if (!fs.existsSync(testResult)) {
    fs.mkdirSync(testResult);
}

function head(s: string): string {
    const pos = s.indexOf("\n");
    return s.substring(0, pos)
}

function getProperty(keyword: string, data: string) {
    const re = new RegExp("//" + keyword + "=(.*)");
    const result = re.exec(data);
    if (result) {
        return result[1];
    }
    return null;
}

function getTestConditions(srcfile: string) {
    let data = '';
    try {
        data = fs.readFileSync(srcfile, 'utf-8');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    const keys = ['message', 'status', 'diff', 'exec'];
    const props = new Array();
    keys.forEach(function (key) {
        let result = getProperty(key, data);
        props[key] = result;
    });
    return props;
}

function testScript(srcfile: string) {
    const opts = {
        encoding: 'utf8'
    };
    return spawnSync('node', [compiler, srcfile], opts);
}

function changeExt(srcfile: string, newext: string): string {
    const ext = path.extname(srcfile);
    const fname = path.basename(srcfile, ext);
    const outfile = path.format({ dir: path.dirname(srcfile), name: fname, ext: newext });  // 出力ファイルの組み立て
    return outfile;
}

function diffFile(src1: string, src2: string): number {
    let data1 = '';
    let data2 = '';
    let status = 0;
    try {
        status = -1;
        data1 = fs.readFileSync(src1, 'utf-8');
        status = -2;
        data2 = fs.readFileSync(src2, 'utf-8');
    } catch (err) {
        // console.error(err);
        return status;
    }
    return (data1 == data2) ? 1 : 0;
}


var files = fs.readdirSync(testDir);
files.filter(function (file) {
    return /\.hst$/.test(file);
}).forEach(function (file) {
    const path = testDir + "\\" + file;
    const cond = getTestConditions(path);
    const result = testScript(path);
    let checked = false;
    let ok = true;
    let s_result = "";
    if (cond['diff'] == "1") {
        const r_diff = diffFile(changeExt(testResult + "\\" + file, ".mac"),
                                changeExt(testRef + "\\" + file, ".mac"));
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
    } else {
        s_result += "-";
    }
    if (cond['status'] !== null) {
        checked = true;
        if (cond['status'] == result['status']) {
            s_result += "o";
        } else {
            s_result += "x";
            ok = false;
        }
    } else {
        s_result += "-";
    }
    if (cond['message'] !== null) {
        if (cond['message'] == head(result['stdout'])) {
            s_result += "o";
        } else {
            s_result += "x";
            ok = false;
        }
        checked = true;
    } else {
        s_result += "-";
    }
    // if (cond['exec'] && cond['status'] == 0) {
    if (result.status == 0) {  // コンパイルが成功したら実行してみる
        const macrofile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".mac");
        const outfile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".out");

        try {
            fs.unlinkSync(outfile);
        } catch (err) {
            var dummy = 1;  // デバッグ用ダミー
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
            const r_diff = diffFile(changeExt(testResult + "\\" + file, ".out"),
                changeExt(testRef + "\\" + file, ".out"));
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
        } else {
            s_result += "-";
        }
    } else {
        s_result += "-";
    }
    var s_ok = ok ? "OK" : "NG";
    console.log(file + "\t" + s_ok + "\t" + s_result);
});

process.exit(0);
