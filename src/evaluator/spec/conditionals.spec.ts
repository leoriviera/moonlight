import test from 'ava';

import { Evaluator } from '../index';
import { Integer, Null } from '../objects';

test('if conditionals should evaluate properly', (t) => {
    const conditionalsTests = [
        {
            input: 'if (true) { 10 }',
            expected: 10,
        },
        {
            input: 'if (false) { 10 } else { 20 }',
            expected: 20,
        },
        {
            input: 'if (1) { 10 }',
            expected: 10,
        },
        {
            input: 'if (1 < 2) { 10 }',
            expected: 10,
        },
        {
            input: 'if (1 < 2) { 10 } else { 20 }',
            expected: 10,
        },
        {
            input: 'if (1 > 2) { 10 } else { 20 }',
            expected: 20,
        },
    ];

    for (const test of conditionalsTests) {
        const result = new Evaluator(test.input).evaluate();

        t.true(result instanceof Integer);
        t.is(result?.value, test.expected);
    }
});

test('falsy if conditionals without an alternative should evaluate NULL', (t) => {
    const conditionalsTests = [
        {
            input: 'if (false) { 10 }',
            expected: null,
        },
        {
            input: 'if (1 > 2) { 10 }',
            expected: null,
        },
    ];

    for (const test of conditionalsTests) {
        const result = new Evaluator(test.input).evaluate();

        t.true(result instanceof Null);
        t.is(result?.value, test.expected);
    }
});
