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

call fact  5;#_0=##return;
#f=#_0;
message  str( #f);
```


## 秀スクリプト実行に必要なもの

秀スクリプトは秀丸マクロを生成するコンパイラなので、なにはなくとも、秀丸は必要です。秀丸のバージョンは、サブルーチンのネストは200回までに拡張された Ver8.73 以降の使用をお勧めします。  
その他、以下のものがあると色々遊べます。

- 秀丸 Ver8.73以降（必須）
- Node.js （Node.jsでもコンパイラは動作します）
- TypeScript コンパイラ （秀スクリプトの改良、修正に使用します）
- Git / Github（秀スクリプトのソースはGithubで管理されています）

※ 徳丸自身はTypeScript処理系として Microsoft Visual Studio Community 2017を使っています。  
※ 秀スクリプトは、秀丸上でもコンパイルできるので、秀丸だけでも秀スクリプトの機能追加等はできますが、秀丸上ではコンパイルが遅いので現実的ではありません。このため、適当な TypeScript処理系を用いた方がよいでしょう。Visual Studio Community は個人やオープンソース ソフトウェアの開発者は無料で使用できます。



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
- hidescript.mac を hs.mac にリネームして秀丸上でマクロ登録しておく
- foo.hsを秀丸で開く
- ショートカットキー等によりhidescript.macを実行する
- foo.macのウィンドウが開き、コンパイル結果が挿入される
- foo.macをショートカット等で実行する

※ hidescript.ts は上記方法で秀スクリプトとしてコンパイルできます。  
※ hidescript.mac を hs.mac とリネームして登録する理由は、前記コンパイル時にコンパイラが上書きされることを防ぐためです。

# [文法](docs/syntax.md) はこちら

