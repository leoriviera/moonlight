import test from 'ava';

import { Token, tokenList } from '../tokens';

import {
    BooleanLiteral,
    Identifier,
    If,
    Infix,
    IntegerLiteral,
    Prefix,
} from './expression';
import { BlockStatement } from './statement';

test('identifiers produce expected string output', (t) => {
    const token = new Token(tokenList.IDENTIFIER, 'foobar');
    const identifier = new Identifier(token);
    t.is(identifier.toString(), 'foobar');
});

test('booleans produce expected string output', (t) => {
    const trueToken = new Token(tokenList.TRUE, 'true');
    const trueBoolean = new BooleanLiteral(trueToken);
    t.is(trueBoolean.toString(), 'true');

    const falseToken = new Token(tokenList.FALSE, 'false');
    const falseBoolean = new BooleanLiteral(falseToken);
    t.is(falseBoolean.toString(), 'false');
});

test('integer literals produce expected string output', (t) => {
    const integerToken = new Token(tokenList.INTEGER, '42');
    const integerLiteral = new IntegerLiteral(integerToken);
    t.is(integerLiteral.toString(), '42');
});

test('prefix expressions produce expected string output', (t) => {
    const prefixToken = new Token(tokenList.IDENTIFIER, '!');
    const right = new BooleanLiteral(new Token(tokenList.TRUE, 'true'));
    const prefixExpression = new Prefix(prefixToken, right);
    t.is(prefixExpression.toString(), '(!true)');
});

test('infix expressions produce expected string output', (t) => {
    const infixToken = new Token(tokenList.PLUS, '+');
    const left = new IntegerLiteral(new Token(tokenList.INTEGER, '1'));
    const right = new IntegerLiteral(new Token(tokenList.INTEGER, '2'));

    const infixExpression = new Infix(infixToken, left, right);
    t.is(infixExpression.toString(), '(1 + 2)');
});

test('if expressions with no alternative produce expected string output', (t) => {
    const ifToken = new Token(tokenList.IF, 'if');

    const p = new Identifier(new Token(tokenList.IDENTIFIER, 'p'));
    const q = new Identifier(new Token(tokenList.IDENTIFIER, 'q'));

    const condition = new BlockStatement(new Token(tokenList.LEFT_BRACE, '{'), [
        new Infix(new Token(tokenList.GREATER_THAN, '>'), p, q),
    ]);

    const consequence = new BlockStatement(
        new Token(tokenList.LEFT_BRACE, '{'),
        [new IntegerLiteral(new Token(tokenList.INTEGER, '42'))]
    );

    const ifExpression = new If(ifToken, condition, consequence);
    t.is(ifExpression.toString(), 'if (p > q) 42');
});

test('if expressions with an alternative produce expected string output', (t) => {
    const ifToken = new Token(tokenList.IF, 'if');

    const x = new Identifier(new Token(tokenList.IDENTIFIER, 'x'));
    const y = new Identifier(new Token(tokenList.IDENTIFIER, 'y'));

    const condition = new BlockStatement(new Token(tokenList.LEFT_BRACE, '{'), [
        new Infix(new Token(tokenList.GREATER_THAN, '>'), x, y),
    ]);

    const consequence = new BlockStatement(
        new Token(tokenList.LEFT_BRACE, '{'),
        [new IntegerLiteral(new Token(tokenList.INTEGER, '1'))]
    );
    const alternative = new BlockStatement(
        new Token(tokenList.LEFT_BRACE, '{'),
        [new IntegerLiteral(new Token(tokenList.INTEGER, '2'))]
    );

    const ifExpression = new If(ifToken, condition, consequence, alternative);
    t.is(ifExpression.toString(), 'if (x > y) 1 else 2');
});
