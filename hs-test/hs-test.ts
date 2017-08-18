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
    const keys = ['message', 'status', 'diff', 'exec', 'expected'];
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
        if (err.code !== "ENOENT")
            throw err;
        return status;
    }
    return (data1 == data2) ? 1 : 0;
}

function compareMacro(file1: string, file2: string): string {
    const r_diff = diffFile(file1, file2);
    // diffの実行
    var result: string;
    switch (r_diff) {
        case 1:
            return "o";
        case 0:
            return "x";
        case -1:
            return "a";
        case -2:
            return "b";
        default:
            console.log("Cannot happen");
            process.exit(1);
    }
}

let ok_count = 0;
let ex_count = 0;
let ng_count = 0;

function doIt(file : string): void {
    const path = testDir + "\\" + file;
    const cond = getTestConditions(path);
    const macrofile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".mac");
    const outfile = changeExt(process.cwd() + "\\" + testResult + "\\" + file, ".out");
    let expected = false;

    try {
        fs.unlinkSync(macrofile); // コンパイル結果のマクロファイルを削除しておく
    } catch (err) {
        if (err.code !== "ENOENT")
            throw err;
    }
    const result = testScript(path);    // コンパイル実行
    let message = head(result['stdout']);

    // 以下、コンパイル結果のチェック
    let ok = true;
    let s_result = "";
    if (cond['status'] !== null) {
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
        if (cond['message'] === message) {
            s_result += "o";
        } else {
            s_result += "x";
            ok = false;
        }
    } else {
        s_result += "-";
    }
    if (cond['diff'] == "1") {
        const r = compareMacro(macrofile, changeExt(testRef + "\\" + file, ".mac"));
        s_result += r;
        if (r != "o")
            ok = false;
    } else {
        s_result += "-";
    }
    if (cond['expected'] == "1") {
        expected = true;
    }
    if (result.status == 0) {  // コンパイルが成功したら実行してみる
        message = ""; // メッセージは削除しておく
        try {
            fs.unlinkSync(outfile);  // 実行結果のファイルを先に削除しておく
        } catch (err) {
            if (err.code !== "ENOENT")
                throw err;
        }
        var run_result = spawnSync(hidemarupath, ["/x", macrofile, outfile], { encoding: 'utf8' });

        // exec=1 の場合は実行結果のチェック
        if (cond['exec'] == "1") {
            //  http://nodejs.jp/nodejs.org_ja/api/path.html 
            // diffの実行
            const r = compareMacro(changeExt(testResult + "\\" + file, ".out"), changeExt(testRef + "\\" + file, ".out"));
            s_result += r;
            if (r != "o")
                ok = false;
        } else {
            s_result += "-";
        }
    } else {
        s_result += "-";
    }
    let s_ok: string;
    if (ok) {
        s_ok = "OK";
        ok_count++;
    } else if (expected) {
        s_ok = "EX";
        ex_count++;
    } else {
        s_ok = "NG";
        ng_count++;
    }
    console.log(file + "\t" + s_ok + "\t" + s_result + "\t" + message);
}

var argv = process.argv;
if (argv.length >= 3) {
    for (var n = 2; n < argv.length; n++) {
        doIt(argv[n]);
    }
} else {
    var files = fs.readdirSync(testDir);
    files.filter(function (file) {
        return /\.hst$/.test(file);
    }).forEach(doIt);
}

console.log("OK count = " + ok_count);
console.log("EX count = " + ex_count + "  (Expected Fail)");
console.log("NG count = " + ng_count);

process.exit(0);
