/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test from 'ava';

import { ExpressionStatement, Prefix } from '../../ast';
import { Parser } from '../index';

import { testLiteralExpression } from './utils/expression';
import { assertProgramValid } from './utils/program';

test('test prefix expressions with semicolons', (t) => {
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
        assertProgramValid(t, program);

        const s = program!.statements[0] as ExpressionStatement<Prefix>;

        t.is(s.expression.operator, test.operator);
        testLiteralExpression(t, s.expression.right, test.value);
    }
});

test('test prefix expressions without semicolons', (t) => {
    const prefixTests = [
        { input: '!5', operator: '!', value: 5 },
        { input: '-69', operator: '-', value: 69 },
        { input: '!true', operator: '!', value: true },
        { input: '!false', operator: '!', value: false },
    ];

    for (const test of prefixTests) {
        const p = new Parser(test.input);
        const program = p.parseProgram();

        t.deepEqual(p.errors, []);
        assertProgramValid(t, program);

        const s = program!.statements[0] as ExpressionStatement<Prefix>;

        t.is(s.expression.operator, test.operator);
        testLiteralExpression(t, s.expression.right, test.value);
    }
});
