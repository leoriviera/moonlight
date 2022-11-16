import test from 'ava';

import { Evaluator } from '../index';
import { Str } from '../objects';

test('strings evaluate properly', (t) => {
    const stringTests = [
        {
            input: '"hello!"',
            expected: 'hello!',
        },
        {
            input: '"hello, world!"',
            expected: 'hello, world!',
        },
        {
            input: '"hello, world! 🌎👨‍👩‍👧"',
            expected: 'hello, world! 🌎👨‍👩‍👧',
        },
        {
            input: '"hello,\\\\world! 🌎👨‍👩‍👧";',
            expected: 'hello,\\world! 🌎👨‍👩‍👧',
        },
        {
            input: '"hello,\\"world! 🌎👨‍👩‍👧";',
            expected: 'hello,"world! 🌎👨‍👩‍👧',
        },
        {
            input: '"\n"',
            expected: '\n',
        },
        // TODO - fix this case
        // {
        //     input: '"\"',
        //     expected: FAILURE (but it doesn't fail)
        // }
    ];

    for (const test of stringTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Str);
        t.is(result?.value, test.expected);
    }
});

test('string concatenation works properly', (t) => {
    const stringTests = [
        {
            input: '"hello" + "world"',
            expected: 'helloworld',
        },
        {
            input: '"hello" + " " + "world"',
            expected: 'hello world',
        },
        {
            input: '"hello" + " " + "world" + "!"',
            expected: 'hello world!',
        },
        {
            input: '"hello" + " " + "world" + "!" + " 🌎👨‍👩‍👧"',
            expected: 'hello world! 🌎👨‍👩‍👧',
        },
        {
            input: '"\\\\" + "b"',
            expected: '\\b',
        },
        {
            input: '"" + "\b"',
            expected: '\b',
        },
    ];

    for (const test of stringTests) {
        const result = new Evaluator(test.input).evaluate();

        t.not(result, null);
        t.true(result instanceof Str);
        t.is(result?.value, test.expected);
    }
});
