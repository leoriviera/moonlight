import repl from 'node:repl';

import { Lexer } from './lexer';
import { keywords } from './tokens';

repl.start({
    eval: (input) => {
        const l = new Lexer(input);
        const tokens = l.lexInput();

        return tokens;
    },
    completer: (line: string) => {
        const completed = Object.keys(keywords).filter((keyword) =>
            keyword.startsWith(line)
        );

        return [completed, line];
    },
});
