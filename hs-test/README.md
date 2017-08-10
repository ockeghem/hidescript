# 秀スクリプト・テストシステム

hs-testは秀スクリプトのテストを自動化するプログラムです。

## ディレクトリ構成

```
hs-test -+               hs-test.js hs-test.cmd が置かれている 
         | 
         +-- Test        テストコード
         | 
         +-- TestRef     テストの基準データ
         |
         +-- TestResult  テスト結果（hs-testが生成する）
```



## 起動方法

起動には、同梱の hs-test.cmd を用います。

```
C>hs-test [テストファイル名 ...] 
```

テストファイル名は省略可能で、省略した場合は、Test フォルダ内の全ての .hst ファイルがテストされます。

## テストファイルの構成

テストコード（拡張子は .hst）は、秀スクリプトのコードに以下のテスト指令を追加したものです。
```
//status=0 または 1   [省略不可; コンパイラのステータス 正常:0  エラー:1]
//message=メッセージ  [省略可; コンパイラのエラーメッセージ]
//diff=1              [省略可; diff=1 の場合、コンパイル結果をTestRefフォルダ下の .macファイルと比較する]
//exec=1              [省略可; diff=1 の場合、秀丸マクロの実行結果をTestRefフォルダ下の .outファイルと比較する]
//
秀スクリプトのコード


```


## テスト結果の見方

```
C:>node hs-test.js fib2.hst
fib2.hst        OK      o-oo
OK count = 1
NG count = 0
```

上記の OK の箇所は、テストの成功か失敗を表示します。成功の場合は OK、失敗の場合は NGが表示されます。
その右の、o-oo はテスト項目毎の結果です。以下の4項目を表示します。

1. ステータスが一致しているか　　　　　　　o: 一致 　x: 不一致   -: テストせず
1. エラーメッセージが一致しているか　　　　o: 一致 　x: 不一致   -: テストせず
1. コンパイル結果（.mac）が一致しているか　o: 一致 　x: 不一致   a: コンパイル結果なし  b: 比較対象なし   -: テストせず
1. 実行結果（.out）が一致しているか　　　　o: 一致 　x: 不一致   a: 実行結果なし  b: 比較対象なし   -: テストせず



## Node.jsおよび秀スクリプトの両方で動くテストコード
極めて限定的なケースではあるが、Node.jsおよび秀スクリプトの両方で動くテストコードを作成できる場合があります。
秀スクリプトはTypeScript互換なので、下記の基準によりJavaScriptとしても動くテストコードを記述します。

- 変数をvarで宣言し、かつ数値または文字列で初期化しておくこと。
- 関数の定義は行えない
- 下記のサンプルの要領で、デバッグ表示用組み込み関数の insertln を用いてデバッグ表示する
- 秀丸マクロの文や組み込み関数は node.js では定義されていないので、テストスクリプトの //EOF 以降にエミュレーション関数を定義する

作者は試していませんが、テストコードをTypeScriptコンパイラにより JavaScript形式に変換すれば、もっと広範囲のテストを動かすことができると思います。

```
//status=0
//diff=1
//exec=1
//
var a = 1;
var b = 1;
var n = 3;

insertln(a);
insertln(b);
while (n <= 10) {
  var c = a + b;
  insertln(c);
  a = b;
  b = c;
  n = n + 1;
}

insertln("done");
saveexit();

//EOF     ← //EOF 以降は、秀スクリプトは無視するので、Node.jsの関数記述等を自由に書くことができる。
function saveexit() { }   // saveexit()関数のエミュレーション…ダミー
function insertln(s) {    // insertln()関数のエミュレーション
  if (typeof s === "boolean")
    s = Number(s);
  console.log(s);
}
```
このスクリプトは、node.jsによりJavaScriptコードとして実行できます。

```
C:>node fib2.hst
1
1
2
3
5
8
13
21
34
55
done

```

また、以下のコマンドにより、秀スクリプトのテストとして実行できます。

```
C:>node hs-test.js fib2.hst
fib2.hst        NG      o-bb
OK count = 0
NG count = 1
```

この結果、TestResultフォルダに、fib2.mac（秀丸マクロ）およびfib2.out（実行結果）が生成されます。これらを目視確認あるいは、先のnode.jsによる結果と比較して、問題ないと判断したら、両ファイルをTestRefディレクトリにコピーします。
すると、2回目以降は、TestRefフォルダ内のファイルを基準として、テスト結果を判定します。この場合の実行結果は下記となります。

```
C:>node hs-test.js fib2.hst
fib2.hst        OK      o-oo
OK count = 1
NG count = 0
```


