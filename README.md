# Moonlight

Moonlight is an implementation of the Monkey programming language written using modern TypeScript.

Currently, the project consists of

- a lexer,
- a parser which supports
  - identifiers,
  - integer literals,
  - prefix operators (`!`, `-`),
  - infix operators (`+`, `-`, `*`, `/`, `!=`, `==`, `<`, `>`, `<=`, `>=`),
  - boolean literals (`true`, `false`),
  - grouped expressions, for example (`(x + y) + z`),
- a REPL with autocomplete, implemented using `node:repl`
