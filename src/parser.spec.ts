/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import {
    ExpressionStatement,
    IntegerLiteral,
    LetStatement,
    ReturnStatement,
} from './ast';
import { Parser } from './parser';

const testLetStatement = (
    t: ExecutionContext,
    s: LetStatement,
    expectedName: string
) => {
    const { token, name } = s;

    t.is(token.value, 'let');
    t.is(name.type.value, expectedName);
    t.is(name.value, expectedName);
};

const testReturnStatement = (t: ExecutionContext, s: ReturnStatement) => {
    const { token } = s;

    t.is(token.value, 'return');
};

test('test simple `let` statements', (t) => {
    const input = `
let x = 5;
let y = 25;
let hello = 1337;
`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.is(p.errors.length, 0);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 3);

    const expectedIdentifiers = ['x', 'y', 'hello'];

    for (let i = 0; i < expectedIdentifiers.length; i++) {
        const statement = program!.statements[i];

        testLetStatement(t, statement as LetStatement, expectedIdentifiers[i]);
    }
});

test('identify errors with `let` statements', (t) => {
    const input = `
let x 5;
let = 25;
let 1337;
`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.is(p.errors.length, 3);
    t.deepEqual(p.errors, [
        'Expected next token to be =, got INTEGER instead. (2:6)',
        'Expected next token to be IDENTIFIER, got = instead. (3:4)',
        'Expected next token to be IDENTIFIER, got INTEGER instead. (4:4)',
    ]);
    t.not(program?.statements, undefined);
});

test('test simple `return` statements', (t) => {
    const input = `
return 5;
return 69;
return 120202;
`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.is(p.errors.length, 0);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 3);

    for (let i = 0; i < program!.statements.length; i++) {
        const statement = program!.statements[i];

        testReturnStatement(t, statement as ReturnStatement);
    }
});

test('test simple identifier expressions', (t) => {
    const input = `example;`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.is(p.errors.length, 0);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 1);

    const s = program!.statements[0] as ExpressionStatement;

    t.is(s.expression.value, 'example');
    t.is(s.token.value, 'example');
});

test('test simple integer literal expressions', (t) => {
    const input = `693;`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.is(p.errors.length, 0);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 1);

    const s = program!.statements[0] as ExpressionStatement<IntegerLiteral>;

    t.is(s.expression.value, 693);
    t.is(s.expression.type.value, '693');
});
