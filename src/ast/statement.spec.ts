import test from 'ava';

import { Token, tokenList } from '../tokens';

import { Identifier, Infix, IntegerLiteral } from './expression';
import {
    BlockStatement,
    ExpressionStatement,
    LetStatement,
    Program,
    ReturnStatement,
} from './statement';

test('let statement returns expected string output', (t) => {
    const token = new Token(tokenList.LET, 'let');
    const name = new Identifier(new Token(tokenList.IDENTIFIER, 'foobar'));
    const value = new IntegerLiteral(new Token(tokenList.INTEGER, '42'));
    const statement = new LetStatement(token, name, value);
    t.is(statement.toString(), 'let foobar = 42');
});

test('return statement returns expected string output', (t) => {
    const token = new Token(tokenList.RETURN, 'return');
    const value = new IntegerLiteral(new Token(tokenList.INTEGER, '42'));
    const statement = new ReturnStatement(token, value);
    t.is(statement.toString(), 'return 42');
});

test('expression statement returns expected string output', (t) => {
    const token = new Token(tokenList.IDENTIFIER, 'foobar');
    const expression = new Identifier(token);
    const statement = new ExpressionStatement(token, expression);
    t.is(statement.toString(), 'foobar');
});

test('block statement returns expected string output', (t) => {
    const x = new Identifier(new Token(tokenList.IDENTIFIER, 'x'));
    const y = new Identifier(new Token(tokenList.IDENTIFIER, 'y'));

    const p = new Identifier(new Token(tokenList.IDENTIFIER, 'p'));
    const q = new Identifier(new Token(tokenList.IDENTIFIER, 'q'));

    const statement = new BlockStatement(new Token(tokenList.LEFT_BRACE, '{'), [
        new Infix(new Token(tokenList.GREATER_THAN, '>'), x, y),
        new Infix(new Token(tokenList.LESS_THAN, '<'), p, q),
    ]);

    t.is(statement.toString(), '(x > y)\n(p < q)');
});

test('program returns expected string output', (t) => {
    const program = new Program([
        new LetStatement(
            new Token(tokenList.LET, 'let'),
            new Identifier(new Token(tokenList.IDENTIFIER, 'foobar')),
            new IntegerLiteral(new Token(tokenList.INTEGER, '42'))
        ),
        new ReturnStatement(
            new Token(tokenList.RETURN, 'return'),
            new IntegerLiteral(new Token(tokenList.INTEGER, '42'))
        ),
    ]);
    t.is(program.toString(), 'let foobar = 42\nreturn 42');
});
