//message=void型関数なのに値を返そうとしています
//status=1
var foo: (x: number) => number;
foo = function(x: number): number { return 1; }

var x = foo(1);
