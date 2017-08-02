var n = 5;
var foo: (x: number) => number;
var x = foo(n);
// ...
foo = function (x: number): number { return 1; }
//EOF
endmacro();

var x = "aa" < "bb";
// var x = "aa" - "bb";
var x = "a" > "0";
function foo():number { return 1;}

if (foo() + foo() + foo() > 1) {
 x = 1;
}

if (foo() + foo() + foo() > 1) {
 x = 1;
}

