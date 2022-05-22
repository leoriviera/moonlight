import repl from 'node:repl';
import util from 'node:util';

import { Lexer } from './lexer';
import { Parser } from './parser';
import { keywords } from './tokens';

const { argv } = process;

const parseMode = argv.includes('-p');
const lexMode = argv.includes('-l');

const mode = lexMode ? 'lex' : parseMode ? 'parse' : 'parse';

repl.start({
    eval: (input, _context, _filename, callback) => {
        switch (mode) {
            case 'lex': {
                const l = new Lexer(input);
                callback(null, l.lexInput());
                break;
            }
            case 'parse': {
                const p = new Parser(input);
                const program = p.parseProgram();
                callback(null, program);
                break;
            }
        }
    },
    completer: (line: string, callback) => {
        const completed = Object.keys(keywords).filter((keyword) =>
            keyword.startsWith(line)
        );

        callback(null, [completed, line]);
    },
    writer: (output: string) =>
        util.inspect(output, {
            depth: Infinity,
            colors: true,
        }),
});
