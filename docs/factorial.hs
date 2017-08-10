function factorial(n : number) : number {
  if (n <= 0)
    return 1;
  else
    return factorial(n - 1) * n;
}

var n = 1;
while (n <= 10) {
  insert(str(factorial(n)) + "\n");
  n = n + 1;
}
