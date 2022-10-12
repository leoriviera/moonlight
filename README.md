# Moonlight

Moonlight is an implementation of the Monkey programming language written using modern TypeScript.

Currently, the project consists of

- a lexer, with support for Unicode identifiers (think emoji!),
- a parser which supports
  - identifiers,
  - basic arithmetic
  - integer literals,
  - prefix operators (`!`, `-`),
  - infix operators (`+`, `-`, `*`, `/`, `!=`, `==`, `<`, `>`, `<=`, `>=`),
  - boolean literals (`true`, `false`),
  - grouped expressions, for example (`(x + y) + z`),
  - functions and higher-order functions,
  - closures,
- a REPL with autocomplete, implemented using `node:repl`
