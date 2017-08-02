var n=5;
var foo : (x: number) => number;
var x = foo(n);
// ...
var foo = function (x: number) : number { return 1;}

function factorial(n : number) : number {
  if (n <= 0)
    return 1;
  else
    return factorial(n - 1) * n;
}

//function foo(): number {}
function bar(): number {}

var x: number;

if (foo() > bar()) {
  x = 1;
}

