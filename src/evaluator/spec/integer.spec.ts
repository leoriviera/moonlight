import test from 'ava';

import { Evaluator } from '../index';
import { Integer } from '../objects';

test('integer expressions evaluate properly', (t) => {
    const integerTests = [
        {
            input: '5',
            expected: 5,
        },
        {
            input: '10',
            expected: 10,
        },
        {
            input: '-5',
            expected: -5,
        },
        {
            input: '-10',
            expected: -10,
        },
        {
            input: '5 + 5 + 5 + 5 - 10',
            expected: 10,
        },
        {
            input: '2 * 2 * 2 * 2 * 2',
            expected: 32,
        },
        {
            input: '-50 + 100 + -50',
            expected: 0,
        },
        {
            input: '5 * 2 + 10',
            expected: 20,
        },
        {
            input: '5 + 2 * 10',
            expected: 25,
        },
        {
            input: '20 + 2 * -10',
            expected: 0,
        },
        {
            input: '50 / 2 * 2 + 10',
            expected: 60,
        },
        {
            input: '2 * (5 + 10)',
            expected: 30,
        },
        {
            input: '3 * 3 * 3 + 10',
            expected: 37,
        },
        {
            input: '3 * (3 * 3) + 10',
            expected: 37,
        },
        {
            input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
            expected: 50,
        },
    ];

    for (const test of integerTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Integer);
        t.is(result?.value, test.expected);
    }
});
