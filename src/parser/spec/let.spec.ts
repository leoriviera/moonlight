/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import { FunctionLiteral, Infix, LetStatement } from '../../ast';
import { Parser } from '../index';

import { testLiteralExpression } from './utils/expression';
import { assertProgramValid } from './utils/program';

const testLetStatement = (
    t: ExecutionContext,
    s: LetStatement,
    expectedName: string
) => {
    t.is(s.token.value, 'let');
    t.is(s.name.token.value, expectedName);
    t.is(s.name.value, expectedName);
};

test('test let statements with literal expression values', (t) => {
    const letTests = [
        { input: 'let x = 5;', identifier: 'x', value: 5 },
        { input: 'let y = true;', identifier: 'y', value: true },
        { input: 'let hello = y;', identifier: 'hello', value: 'y' },
    ];

    for (const test of letTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as LetStatement;
        testLetStatement(t, s, test.identifier);
        testLiteralExpression(t, s.value, test.value);
    }
});

test('test let statements with literal expression values and no semicolons', (t) => {
    const letTests = [
        { input: 'let x = 5', identifier: 'x', value: 5 },
        { input: 'let y = true', identifier: 'y', value: true },
        { input: 'let hello = y', identifier: 'hello', value: 'y' },
    ];

    for (const test of letTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as LetStatement;
        testLetStatement(t, s, test.identifier);
        testLiteralExpression(t, s.value, test.value);
    }
});

test('test let statements with call expression and grouped expression values', (t) => {
    const letTests = [
        {
            input: 'let x = add(5, 5);',
            identifier: 'x',
            value: 'add(5, 5)',
        },
        {
            input: 'let y = 5 * 5 / 10 + 18 - add(5, 5) + multiply(124);',
            identifier: 'y',
            value: '(((((5 * 5) / 10) + 18) - add(5, 5)) + multiply(124))',
        },
    ];

    for (const test of letTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as LetStatement<
            FunctionLiteral | Infix
        >;
        testLetStatement(t, s, test.identifier);
        t.is(s.value.toString(), test.value);
    }
});

test('identify errors with let statements', (t) => {
    const input = `
let x 5;
let = 25;
let 1337;
`;

    const p = new Parser(input);
    p.parseProgram();

    t.deepEqual(p.errors, [
        'Expected next token to be =, got INTEGER instead. (2:6)',
        'Expected next token to be IDENTIFIER, got = instead. (3:4)',
        'No prefix parser for =. (3:6)',
        'Expected next token to be IDENTIFIER, got INTEGER instead. (4:4)',
    ]);
});
