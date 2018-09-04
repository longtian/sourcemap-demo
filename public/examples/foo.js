function foo () {
  function bar () {
    throw new Error('An error is thrown');
  }

  bar();
}

foo();