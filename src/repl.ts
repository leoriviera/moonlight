import repl from 'node:repl';

import { Lexer } from './lexer';
import { keywords } from './tokens';

repl.start({
    eval: (input, _context, _filename, callback) => {
        const l = new Lexer(input);
        const tokens = l.lexInput();

        callback(null, tokens);
    },
    completer: (line: string, callback) => {
        const completed = Object.keys(keywords).filter((keyword) =>
            keyword.startsWith(line)
        );

        callback(null, [completed, line]);
    },
});
