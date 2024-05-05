import test from 'ava';

import { Evaluator } from '../index';
import { Err } from '../objects';

test('errors are handled correctly', (t) => {
    const errorTests = [
        {
            input: '5 + true;',
            expected: 'type mismatch: INTEGER + BOOLEAN',
        },
        {
            input: '5 + true; 5;',
            expected: 'type mismatch: INTEGER + BOOLEAN',
        },
        {
            input: '-true',
            expected: 'unknown operator: -BOOLEAN',
        },
        {
            input: 'true + false;',
            expected: 'unknown operator: BOOLEAN + BOOLEAN',
        },
        {
            input: '5; true + false; 5',
            expected: 'unknown operator: BOOLEAN + BOOLEAN',
        },
        {
            input: 'if (10 > 1) { true + false; }',
            expected: 'unknown operator: BOOLEAN + BOOLEAN',
        },
        {
            input: `
                if (10 > 1) {
                    if (10 > 1) {
                        return true + false;
                    }
                    return 1;
                }
            `,
            expected: 'unknown operator: BOOLEAN + BOOLEAN',
        },
        {
            input: 'foobar',
            expected: 'identifier not found: foobar',
        },
        {
            input: '"hello" - "world"',
            expected: 'unknown operator: STRING - STRING',
        },
        {
            input: '"hello" * "world"',
            expected: 'unknown operator: STRING * STRING',
        },
    ];

    for (const test of errorTests) {
        const result = new Evaluator(test.input).evaluate();

        t.true(result instanceof Err);
        t.is(result?.value, test.expected);
    }
});
