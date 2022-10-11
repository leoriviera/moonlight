/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from 'ava';

import { ReturnStatement } from '../../ast';
import { Parser } from '../index';

import { testLiteralExpression } from './utils/expression';
import { assertProgramValid } from './utils/program';

const testReturnStatement = (t: ExecutionContext, s: ReturnStatement) => {
    t.is(s.token.value, 'return');
};

// test('test return statement with no value', (t) => {
//     const returnTests = [{ input: 'return;', value: undefined }];

//     for (const test of returnTests) {
//         const p = new Parser(test.input);
//         t.deepEqual(p.errors, []);

//         const program = p.parseProgram();
//         assertProgramValid(t, program);

//         const s = program!.statements[0] as ReturnStatement;

//         testReturnStatement(t, s);
//         console.log(p.errors);
//         // testLiteralExpression(t, s.returnValue, test.value);
//     }
// });

test('test simple return statements', (t) => {
    const returnTests = [
        { input: 'return 5;', value: 5 },
        { input: 'return true;', value: true },
        { input: 'return y;', value: 'y' },
    ];

    for (const test of returnTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as ReturnStatement;
        testReturnStatement(t, s);
        testLiteralExpression(t, s.returnValue, test.value);
    }
});

test('test simple return statements with no semicolons', (t) => {
    const returnTests = [
        { input: 'return 5', value: 5 },
        { input: 'return true', value: true },
        { input: 'return y', value: 'y' },
    ];

    for (const test of returnTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as ReturnStatement;
        testReturnStatement(t, s);
        testLiteralExpression(t, s.returnValue, test.value);
    }
});

test;

test('test return statement with call expression or grouped expression values', (t) => {
    const returnTests = [
        { input: 'return 5 + 5;', value: '(5 + 5)' },
        {
            input: 'return add(10, 5);',
            value: 'add(10, 5)',
        },
    ];

    for (const test of returnTests) {
        const p = new Parser(test.input);
        t.deepEqual(p.errors, []);

        const program = p.parseProgram();
        assertProgramValid(t, program);

        const s = program!.statements[0] as ReturnStatement;
        testReturnStatement(t, s);
        t.is(s.returnValue?.toString(), test.value);
    }
});
