import test from 'ava';

import { Evaluator } from '../index';
import { Bool } from '../objects';

test('boolean expressions evaluate properly', (t) => {
    const booleanTests = [
        {
            input: 'true',
            expected: true,
        },
        {
            input: 'true == true',
            expected: true,
        },
        {
            input: 'false == false',
            expected: true,
        },
        {
            input: 'true != false',
            expected: true,
        },
        {
            input: 'false != true',
            expected: true,
        },
        {
            input: '1 < 2',
            expected: true,
        },
        {
            input: '(1 < 2) == true',
            expected: true,
        },
        {
            input: '(1 > 2) == false',
            expected: true,
        },
        {
            input: '1 == 1',
            expected: true,
        },
        {
            input: '1 != 2',
            expected: true,
        },
        {
            input: 'false',
            expected: false,
        },
        {
            input: 'false == true',
            expected: false,
        },
        {
            input: 'true == false',
            expected: false,
        },
        {
            input: '1 > 2',
            expected: false,
        },
        {
            input: '(1 < 2) == false',
            expected: false,
        },
        {
            input: '(1 > 2) == true',
            expected: false,
        },
        {
            input: '1 < 1',
            expected: false,
        },
        {
            input: '1 > 1',
            expected: false,
        },
        {
            input: '1 != 1',
            expected: false,
        },
        {
            input: '1 == 2',
            expected: false,
        },
    ];

    for (const test of booleanTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Bool);
        t.is(result?.value, test.expected);
    }
});
