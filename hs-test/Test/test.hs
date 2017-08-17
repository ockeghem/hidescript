//status=0
//diff=1
//exec=1
//

function isAlnum(chx: string): boolean {
    return (chx >= "A" && chx <= "Z") || (chx >= "a" && chx <= "z") || (chx >= "0" && chx <= "9");
}

function urlencode(s: string): string {
  var len = wcslen(s);
  var n = 0;
  var out = "";
  while (n < len) {
    var ch = wcsmidstr(s, n, 1);
    var cp = unicode(ch);

    if (isAlnum(ch)) {
      out = out + ch;
    } else if (cp < 0x80) {
      out = out + sprintf("%%%02X", cp);
    } else if (cp < 0x800) {
      out = out + sprintf("%%%02X", 0xc0 | (cp / 64)) + sprintf("%%%02X", 0x80 | (cp & 0x3f));
    } else if (cp >= 0xd800 && cp <= 0xdfff) {
      n = n + 1;
      var cp2 = unicode(wcsmidstr(s, n, 1));
      var x = 0x10000 + (cp - 0xd800) * 0x400 + (cp2 - 0xdc00);
      out = out + sprintf("%%%02X", 0xf0 | (x / 262144)) + sprintf("%%%02X", 0x80 | ((x / 4096) & 0x3f)) + sprintf("%%%02X", 0x80 | ((x / 64) & 0x3f)) + sprintf("%%%02X", 0x80 | (x & 0x3f));
    } else {
      out = out + sprintf("%%%02X", 0xe0 | (cp / 4096)) + sprintf("%%%02X", 0x80 | ((cp / 64) & 0x3f)) + sprintf("%%%02X", 0x80 | (cp & 0x3f));
    }
    n = n + 1;
  }
  return out;
}


var key = "相席居酒屋";

var enKey = urlencode(key);

insert(enKey);
var tempfile = "d:\\temp\\temp.html";
var url = "http://aramakijake.jp/keyword/index.php?keyword=" + enKey;
runsync2("wget -O " + tempfile + " " + url);
if (! result()) {
  message("コマンド実行に失敗しました");
  endmacro();
}

var winno = findhidemaru(tempfile);
if (winno == -1) {
  openfile(tempfile);
} else {
  setactivehidemaru(winno);
}

//insertln("done");
//saveexit();
