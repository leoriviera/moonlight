import repl from 'node:repl';
import util from 'node:util';

import { Lexer } from './lexer';
import { Parser } from './parser';
import { keywords } from './tokens';

const { argv } = process;

const parseMode = argv.includes('-p') || true;
const astMode = argv.includes('-a');
const lexMode = argv.includes('-l');

repl.start({
    eval: (input, _context, _filename, callback) => {
        if (astMode) {
            const p = new Parser(input);
            const program = p.parseProgram();
            callback(null, program);
            return;
        }

        if (lexMode) {
            const lexer = new Lexer(input);
            const tokens = lexer.lexInput();
            callback(null, tokens);
            return;
        }

        if (parseMode) {
            const p = new Parser(input);
            const program = p.parseProgram();
            const string = program?.toString();
            callback(null, string);
            return;
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
