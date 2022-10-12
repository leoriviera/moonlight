import test from 'ava';

import { Evaluator } from '../index';
import { Integer } from '../objects';

test('let statements evaluate and bind to variables', (t) => {
    const letTests = [
        {
            input: 'let a = 5; a;',
            expected: 5,
        },
        {
            input: 'let a = 5 * 5; a;',
            expected: 25,
        },
        {
            input: 'let a = 5; let b = a; b;',
            expected: 5,
        },
        {
            input: 'let a = 5; let b = a; let c = a + b + 5; c;',
            expected: 15,
        },
    ];

    for (const test of letTests) {
        const result = new Evaluator(test.input).evaluate();

        t.true(result instanceof Integer);
        t.is(result?.value, test.expected);
    }
});
