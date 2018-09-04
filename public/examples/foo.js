function foo () {
  function bar () {
    throw new Error('A custom error is thrown');
  }

  bar();
}

foo();