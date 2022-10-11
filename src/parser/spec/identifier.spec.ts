/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test from 'ava';

import { Parser } from '..';
import { ExpressionStatement, Identifier, IntegerLiteral } from '../../ast';

import { testLiteralExpression } from './utils/expression';
import { assertProgramValid } from './utils/program';

test('test simple identifier expressions', (t) => {
    const input = `example;`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.deepEqual(p.errors, []);
    assertProgramValid(t, program);

    const s = program!.statements[0] as ExpressionStatement<Identifier>;

    testLiteralExpression(t, s.expression, 'example');
});

test('test simple integer literal expressions', (t) => {
    const input = `693;`;

    const p = new Parser(input);
    const program = p.parseProgram();

    t.deepEqual(p.errors, []);
    assertProgramValid(t, program, 1);

    const s = program!.statements[0] as ExpressionStatement<IntegerLiteral>;

    testLiteralExpression(t, s.expression, 693);
});
