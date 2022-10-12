import test from 'ava';

import { Evaluator } from '../index';
import { Bool } from '../objects';

test('bang operator evaluates properly', (t) => {
    const bangTests = [
        {
            input: '!true',
            expected: false,
        },
        {
            input: '!false',
            expected: true,
        },
        {
            input: '!5',
            expected: false,
        },
        {
            input: '!!true',
            expected: true,
        },
        {
            input: '!!false',
            expected: false,
        },
        {
            input: '!!5',
            expected: true,
        },
    ];

    for (const test of bangTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Bool);
        t.is(result?.value, test.expected);
    }
});
