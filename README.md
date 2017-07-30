# 秀スクリプト


# 秀スクリプトの概要

秀スクリプトは、TypeScriptに似た文法を持つスクリプト言語で、コンパイラにより秀丸マクロに変換され、秀丸上で実行されます。

秀スクリプトの拡張子は特に決まりはありませんが、hsを推奨します。

秀スクリプトの例:

```
function fact(n: number) : number {
  if (n == 0)
    return 1;
  return fact(n - 1) * n;
}

var f = fact(5);
message(str(f));
```

コンパイル結果は下記の通り（見やすくするため字下げを加えました）

```
goto _end_fact
fact:
	if ( ##1==0) {
		return 1;
	}
	call fact  ##1-1;##_0=##return;
	return ##_0*##1;
	return;
_end_fact:

call fact  5;#_1=##return;
#f=#_1;
message  str( #f);
```


# 秀スクリプトのコンパイル方式

秀スクリプトのコンパイラは、秀スクリプト自身として書かれており、秀丸マクロにコンパイルされた形で秀丸上で実行することができます。また、秀スクリプトがTypeScriptに似ていることから、秀スクリプトコンパイラはTypeScriptとしても実行できるように記述されています。この場合は、秀スクリプトはいったんJavaScriptにコンパイルされ、Node.js上で動かすことになります。

秀スクリプトコンパイラをコンパイルする foo.hs 

## (1) TypeScript+Node.jsとして実行する
- hidescript.ts をTypeScriptコンパイラによりコンパイルする。hidescript.jsが生成される
- hidescript.js をNode.js上で実行する

C:> node hidescript.js foo.hs

- foo.mac ができるので、秀丸で実行する

※ 環境変数 hidemacrodirに秀丸マクロ用フォルダ名をセットしておくと、そのフォルダにfoo.macが書き込まれます。


## (2)秀丸マクロとして実行する
- 予め、hs.mac を秀丸上でマクロ登録しておく。
- foo.hsを秀丸で開く
- ショートカットキー等によりhidescript.macを実行する
- foo.macのウィンドウが開き、コンパイル結果が挿入される
- foo.macをショートカット等で実行する



## 1. [文法](syntax.md)



![エビフライトライアングル](images/Jjwsc.jpg "サンプル")



vartype

s 文字列型（スカラ）
n 数値型（スカラ）
S 文字列配列
N 数値配列


