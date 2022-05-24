/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import {
    BooleanLiteral,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    If,
    Infix,
    IntegerLiteral,
    LetStatement,
    Prefix,
    ReturnStatement,
} from './ast';
import { Parser } from './parser';
import { testLiteralExpression } from './spec/utils/expression';
import { Token, tokenList } from './tokens';

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

    testLiteralExpression(t, s.expression, 693);
});

test('test prefix expressions', (t) => {
    const prefixTests = [
        { input: '!5;', operator: '!', value: 5 },
        { input: '-69;', operator: '-', value: 69 },
        { input: '!true;', operator: '!', value: true },
        { input: '!false;', operator: '!', value: false },
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
        testLiteralExpression(
            t,
            s.expression.right as IntegerLiteral,
            test.value
        );
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
        { input: 'true == true;', left: true, operator: '==', right: true },
        { input: 'true != false;', left: true, operator: '!=', right: false },
        { input: 'false == false;', left: false, operator: '==', right: false },
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
        testLiteralExpression(t, s.expression.left, test.left);
        testLiteralExpression(t, s.expression.right, test.right);
    }
});

test('test operator precedence parsing', (t) => {
    const operatorPrecedenceTests = [
        { input: '-a * b;', expected: '((-a) * b)' },
        { input: '!-a;', expected: '(!(-a))' },
        { input: 'a + b + c;', expected: '((a + b) + c)' },
        { input: 'a + b - c;', expected: '((a + b) - c)' },
        { input: 'a * b * c;', expected: '((a * b) * c)' },
        { input: 'a * b / c;', expected: '((a * b) / c)' },
        { input: 'a + b / c;', expected: '(a + (b / c))' },
        {
            input: 'a + b * c + d / e - f;',
            expected: '(((a + (b * c)) + (d / e)) - f)',
        },
        { input: '3 + 4; -5 * 5;', expected: '(3 + 4)\n((-5) * 5)' },
        { input: '5 > 4 == 3 < 4;', expected: '((5 > 4) == (3 < 4))' },
        { input: '5 < 4 != 3 > 4;', expected: '((5 < 4) != (3 > 4))' },
        {
            input: '3 + 4 * 5 == 3 * 1 + 4 * 5;',
            expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
        },
        { input: '3*4;', expected: '(3 * 4)' },
        { input: 'true;', expected: 'true' },
        { input: 'false;', expected: 'false' },
        { input: '3 > 5 == false;', expected: '((3 > 5) == false)' },
        { input: '3 < 5 == true;', expected: '((3 < 5) == true)' },
        { input: '1 + (2 + 3) + 4;', expected: '((1 + (2 + 3)) + 4)' },
        { input: '(5 + 5) * 2;', expected: '((5 + 5) * 2)' },
        { input: '2 / (5 + 5);', expected: '(2 / (5 + 5))' },
        { input: '-(5 + 5);', expected: '(-(5 + 5))' },
        { input: '!(true == true);', expected: '(!(true == true))' },
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

test('test boolean expression', (t) => {
    const booleanTests = [
        { input: 'true;', value: true },
        { input: 'false;', value: false },
    ];

    for (const test of booleanTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!.statements[0] as ExpressionStatement<BooleanLiteral>;

        testLiteralExpression(t, s.expression, test.value);
    }
});

test('test if expressions with no alternative', (t) => {
    const ifTests = [
        {
            input: 'if (x < y) { x }',
            condition: '(x < y)',
            consequence: 'x',
        },
        {
            input: 'if (x > y) { y }',
            condition: '(x > y)',
            consequence: 'y',
        },
        {
            input: 'if (!x) { y }',
            condition: '(!x)',
            consequence: 'y',
        },
    ];

    for (const test of ifTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!.statements[0] as ExpressionStatement<If>;

        t.is(s.expression.condition?.toString(), test.condition);
        t.is(
            (
                s.expression.consequence.statements[0] as ExpressionStatement
            ).expression?.toString(),
            test.consequence
        );
        t.is(s.expression.alternative, null);
    }
});

test('test if expressions with an alternative', (t) => {
    const ifTests = [
        {
            input: 'if (x < y) { x } else { y }',
            condition: '(x < y)',
            consequence: 'x',
            alternative: 'y',
        },
        {
            input: 'if (x > y) { x } else { y }',
            condition: '(x > y)',
            consequence: 'x',
            alternative: 'y',
        },
        {
            input: 'if (!x) { x } else { y }',
            condition: '(!x)',
            consequence: 'x',
            alternative: 'y',
        },
    ];

    for (const test of ifTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!.statements[0] as ExpressionStatement<If>;

        t.is(s.expression.condition?.toString(), test.condition);

        t.is(
            (
                s.expression.consequence.statements[0] as ExpressionStatement
            ).expression?.toString(),
            test.consequence
        );

        t.is(
            (
                s.expression.alternative?.statements[0] as ExpressionStatement
            ).expression?.toString(),
            test.alternative
        );
    }
});

test.only('test function literal and parameters', (t) => {
    const fnTests = [
        {
            input: 'fn() { };',
            parameters: [],
            body: '',
        },
        {
            input: 'fn(x) { };',
            parameters: [new Identifier(new Token(tokenList.IDENTIFIER, 'x'))],
            body: '',
        },
        {
            input: 'fn(x, y) { x + y; }',
            parameters: [
                new Identifier(new Token(tokenList.IDENTIFIER, 'x')),
                new Identifier(new Token(tokenList.IDENTIFIER, 'y')),
            ],
            body: '(x + y)',
        },
        {
            input: 'fn(x, y, z) { x + y + z; };',
            parameters: [
                new Identifier(new Token(tokenList.IDENTIFIER, 'x')),
                new Identifier(new Token(tokenList.IDENTIFIER, 'y')),
                new Identifier(new Token(tokenList.IDENTIFIER, 'z')),
            ],
            body: '((x + y) + z)',
        },
        {
            input: 'fn(x, y, z) { };',
            parameters: [
                new Identifier(new Token(tokenList.IDENTIFIER, 'x')),
                new Identifier(new Token(tokenList.IDENTIFIER, 'y')),
                new Identifier(new Token(tokenList.IDENTIFIER, 'z')),
            ],
            body: '',
        },
        // {
        //     input: 'fn(x, y, z) { return x + y; }',
        //     parameters: [
        //         new Identifier(new Token(tokenList.IDENTIFIER, 'x')),
        //         new Identifier(new Token(tokenList.IDENTIFIER, 'y')),
        //         new Identifier(new Token(tokenList.IDENTIFIER, 'z')),
        //     ],
        //     body: 'return (x + y)',
        // },
    ];

    for (const test of fnTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        console.log(program?.toString());

        t.deepEqual(p.errors, []);
        t.not(program, null);
        t.not(program?.statements, undefined);
        t.is(program?.statements.length, 1);

        const s = program!
            .statements[0] as ExpressionStatement<FunctionLiteral>;

        t.is(s.expression.parameters?.length, test.parameters.length);
        t.deepEqual(s.expression.parameters, test.parameters);
        t.is(s.expression.body?.toString(), test.body);
    }
});
