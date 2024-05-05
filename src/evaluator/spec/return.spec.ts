import test from 'ava';

import { Evaluator } from '../index';
import { Integer, Str } from '../objects';

test('return statements evaluate numbers properly', (t) => {
    const returnTests = [
        {
            input: 'return 10',
            expected: 10,
        },
        {
            input: 'return 10; 9;',
            expected: 10,
        },
        {
            input: 'return 2 * 5; 9',
            expected: 10,
        },
        {
            input: '9; return 2 * 5; 9',
            expected: 10,
        },
        {
            input: `
                if (10 > 1) {
                    if (10 > 1) {
                        return 10;
                    }
                    return 1;
                }
            `,
            expected: 10,
        },
    ];

    for (const test of returnTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Integer);
        t.is(result?.value, test.expected);
    }
});

test('return statements evaluate strings properly', (t) => {
    const returnTests = [
        {
            input: 'return "hello, world!"',
            expected: 'hello, world!',
        },
        {
            input: 'return "hello, world! 🌎👨‍👩‍👧"',
            expected: 'hello, world! 🌎👨‍👩‍👧',
        },
        {
            input: 'return "\n"',
            expected: '\n',
        },
        {
            input: 'return "\t"',
            expected: '\t',
        },
        {
            input: 'return "hello" + " world!"',
            expected: 'hello world!',
        },
        {
            input: 'return "hello" + " " + "world! 👨‍👩‍👧"',
            expected: 'hello world! 👨‍👩‍👧',
        },
    ];

    for (const test of returnTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Str);
        t.is(result?.value, test.expected);
    }
});
