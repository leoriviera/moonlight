/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import { LetStatement, ReturnStatement } from './ast';
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

const testReturnStatement = (
    t: ExecutionContext,
    s: ReturnStatement
    // expectedName: string
) => {
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
    t.is(program?.statements.length, 0);
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

    const expectedValues = ['5', '10', '993322'];

    for (let i = 0; i < expectedValues.length; i++) {
        const statement = program!.statements[i];

        testReturnStatement(
            t,
            statement as ReturnStatement
            // expectedIdentifiers[i]
        );
    }
});
