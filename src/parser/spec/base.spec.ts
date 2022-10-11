/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import {
    BooleanLiteral,
    CallExpression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    If,
    Infix,
    IntegerLiteral,
    Prefix,
    Program,
} from '../../ast';
import { Parser } from '../index';

import { testLiteralExpression } from './utils/expression';

const assertProgramValid = (
    t: ExecutionContext,
    program: Program,
    length: number
) => {
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, length);
};

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
        assertProgramValid(t, program, 1);

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
        assertProgramValid(t, program, 1);

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
        { input: 'a + f(b * c) + d;', expected: '((a + f((b * c))) + d)' },
        {
            input: 'f(a, b, c, d * e, f + g, f(h + i))',
            expected: 'f(a, b, c, (d * e), (f + g), f((h + i)))',
        },
        {
            input: 'f(a + b + c * d / f - g)',
            expected: 'f((((a + b) + ((c * d) / f)) - g))',
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

test('test boolean expression', (t) => {
    const booleanTests = [
        { input: 'true;', value: true },
        { input: 'false;', value: false },
    ];

    for (const test of booleanTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program, 1);

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
        assertProgramValid(t, program, 1);

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
        assertProgramValid(t, program, 1);

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

test('test function literal and parameters', (t) => {
    const fnTests = [
        {
            input: 'fn() { };',
            parameters: [],
            body: '',
        },
        {
            input: 'fn(x) { };',
            parameters: ['x'],
            body: '',
        },
        {
            input: 'fn(x, y) { x + y; }',
            parameters: ['x', 'y'],
            body: '(x + y)',
        },
        {
            input: 'fn(x, y, z) { x + y + z; };',
            parameters: ['x', 'y', 'z'],
            body: '((x + y) + z)',
        },
        {
            input: 'fn(x, y, z) { };',
            parameters: ['x', 'y', 'z'],
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

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program, 1);

        const s = program!
            .statements[0] as ExpressionStatement<FunctionLiteral>;

        t.is(s.expression.parameters?.length, test.parameters.length);

        for (const p in test.parameters) {
            testLiteralExpression(
                t,
                s.expression.parameters![p],
                test.parameters[p]
            );
        }

        t.is(s.expression.body?.toString(), test.body);
    }
});

test('test identifier call expressions with no arguments', (t) => {
    const callExpressionTest = { input: 'a()', identifier: 'a', args: [] };

    const p = new Parser(callExpressionTest.input);
    const program = p.parseProgram();

    t.deepEqual(p.errors, []);
    assertProgramValid(t, program, 1);

    const s = program!.statements[0] as ExpressionStatement<CallExpression>;

    testLiteralExpression(
        t,
        s.expression.fn as Identifier,
        callExpressionTest.identifier
    );

    t.is(s.expression.args?.length, callExpressionTest.args.length);
    t.deepEqual(s.expression.args, callExpressionTest.args);
});

test('test identifier call expressions with infix expression arguments', (t) => {
    const callExpressionTests = [
        {
            input: 'a(1 * 1) ',
            identifier: 'a',
            args: [{ left: 1, operator: '*', right: 1 }],
        },
        {
            input: 'b(4 + 2, 7 - 3)',
            identifier: 'b',
            args: [
                { left: 4, operator: '+', right: 2 },
                { left: 7, operator: '-', right: 3 },
            ],
        },
    ];

    for (const test of callExpressionTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program, 1);

        const s = program!.statements[0] as ExpressionStatement<CallExpression>;

        testLiteralExpression(
            t,
            s.expression.fn as Identifier,
            test.identifier
        );

        t.is(s.expression.args?.length, test.args.length);

        for (const i in test.args) {
            const infixExpression = s.expression.args![i] as Infix;

            t.is(infixExpression.operator, test.args[i].operator);
            testLiteralExpression(t, infixExpression.left, test.args[i].left);
            testLiteralExpression(t, infixExpression.right, test.args[i].right);
        }
    }
});

test('test identifier call expressions with integer literal arguments', (t) => {
    const callExpressionTests = [
        {
            input: 'a(1) ',
            identifier: 'a',
            args: [1],
        },
        { input: 'b(4, 7)', identifier: 'b', args: [4, 7] },
        { input: 'c(3, 4, 6)', identifier: 'c', args: [3, 4, 6] },
    ];

    for (const test of callExpressionTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program, 1);

        const s = program!.statements[0] as ExpressionStatement<CallExpression>;

        testLiteralExpression(
            t,
            s.expression.fn as Identifier,
            test.identifier
        );

        t.is(s.expression.args?.length, test.args.length);

        for (const i in test.args) {
            testLiteralExpression(
                t,
                s.expression.args![i] as ExpressionStatement<IntegerLiteral>,
                test.args[i]
            );
        }
    }
});

test('test identifier call expressions with identifier arguments', (t) => {
    const callExpressionTests = [
        { input: 'a(x) ', identifier: 'a', args: ['x'] },
        { input: 'b(x, y) ', identifier: 'b', args: ['x', 'y'] },
        { input: 'c(x, y, z) ', identifier: 'c', args: ['x', 'y', 'z'] },
    ];

    for (const test of callExpressionTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program, 1);

        const s = program!.statements[0] as ExpressionStatement<CallExpression>;

        testLiteralExpression(
            t,
            s.expression.fn as Identifier,
            test.identifier
        );

        t.is(s.expression.args?.length, test.args.length);

        for (const i in test.args) {
            testLiteralExpression(
                t,
                s.expression.args![i] as Identifier,
                test.args[i]
            );
        }
    }
});
