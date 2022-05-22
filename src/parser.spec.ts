/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import {
    ExpressionStatement,
    Identifier,
    Infix,
    IntegerLiteral,
    LetStatement,
    Prefix,
    ReturnStatement,
} from './ast';
import { Parser } from './parser';

const testLetStatement = (
    t: ExecutionContext,
    s: LetStatement,
    expectedName: string
) => {
    t.is(s.token.value, 'let');
    t.is(s.name.token.value, expectedName);
    t.is(s.name.value, expectedName);
};

const testReturnStatement = (t: ExecutionContext, s: ReturnStatement) =>
    t.is(s.token.value, 'return');

const testIntegerLiteral = (
    t: ExecutionContext,
    i: IntegerLiteral,
    value: number
) => {
    t.is(i.value, value);
    t.is(i.token.value, value.toString());
};

test('test simple `let` statements', (t) => {
    const input = `
let x = 5;
let y = 25;
let hello = 1337;
`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.deepEqual(p.errors, []);
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

    t.deepEqual(p.errors, [
        'Expected next token to be =, got INTEGER instead. (2:6)',
        'Expected next token to be IDENTIFIER, got = instead. (3:4)',
        'No prefix parser for =. (3:6)',
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

    t.deepEqual(p.errors, []);
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

    t.deepEqual(p.errors, []);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 1);

    const s = program!.statements[0] as ExpressionStatement<Identifier>;

    t.is(s.expression.value, 'example');
    t.is(s.token.value, 'example');
});

test('test simple integer literal expressions', (t) => {
    const input = `693;`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.deepEqual(p.errors, []);
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, 1);

    const s = program!.statements[0] as ExpressionStatement<IntegerLiteral>;

    testIntegerLiteral(t, s.expression, 693);
});

test('test prefix expressions', (t) => {
    const prefixTests = [
        {
            input: '!5;',
            operator: '!',
            value: 5,
        },
        {
            input: '-69;',
            operator: '-',
            value: 69,
        },
        // {
        //     input: '!true;',
        //     operator: '!',
        //     value: true,
        // },
    ];

    for (const test of prefixTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!.statements[0] as ExpressionStatement<Prefix>;

        t.is(s.expression.operator, test.operator);
        testIntegerLiteral(t, s.expression.right as IntegerLiteral, test.value);
    }
});

test('test infix expressions', (t) => {
    const infixTests = [
        { input: '5 + 5;', left: 5, operator: '+', right: 5 },
        { input: '5 - 5;', left: 5, operator: '-', right: 5 },
        { input: '5 * 5;', left: 5, operator: '*', right: 5 },
        { input: '5 / 5;', left: 5, operator: '/', right: 5 },
        { input: '5 > 5;', left: 5, operator: '>', right: 5 },
        { input: '5 < 5;', left: 5, operator: '<', right: 5 },
        { input: '5 == 5;', left: 5, operator: '==', right: 5 },
        { input: '5 != 5;', left: 5, operator: '!=', right: 5 },
    ];

    for (const test of infixTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!.statements[0] as ExpressionStatement<Infix>;

        t.is(s.expression.operator, test.operator);
        testIntegerLiteral(t, s.expression.left as IntegerLiteral, test.left);
        testIntegerLiteral(t, s.expression.right as IntegerLiteral, test.right);
    }
});

test('test operator precedence parsing', (t) => {
    const operatorPrecedenceTests = [
        {
            input: '-a * b;',
            expected: '((-a) * b)',
        },
        {
            input: '!-a;',
            expected: '(!(-a))',
        },
        {
            input: 'a + b + c;',
            expected: '((a + b) + c)',
        },
        {
            input: 'a + b - c;',
            expected: '((a + b) - c)',
        },
        {
            input: 'a * b * c;',
            expected: '((a * b) * c)',
        },
        {
            input: 'a * b / c;',
            expected: '((a * b) / c)',
        },
        {
            input: 'a + b / c;',
            expected: '(a + (b / c))',
        },
        {
            input: 'a + b * c + d / e - f;',
            expected: '(((a + (b * c)) + (d / e)) - f)',
        },
        {
            input: '3 + 4; -5 * 5;',
            expected: '(3 + 4)((-5) * 5)',
        },
        {
            input: '5 > 4 == 3 < 4;',
            expected: '((5 > 4) == (3 < 4))',
        },
        {
            input: '5 < 4 != 3 > 4;',
            expected: '((5 < 4) != (3 > 4))',
        },
        {
            input: '3 + 4 * 5 == 3 * 1 + 4 * 5;',
            expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
        },
    ];

    for (const test of operatorPrecedenceTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);

        const string = program!.toString();
        t.is(string, test.expected);
    }
});
