import test from 'ava';

import { Evaluator } from '..';
import { Fn, Integer } from '../objects';

test('functions evaluate properly', (t) => {
    const input = 'fn(x) { x + 2; }';

    const result = new Evaluator(input).evaluate();

    t.true(result instanceof Fn);

    const { params, body } = (result as Fn).value;

    t.is(params.length, 1);
    t.is(params[0].toString(), 'x');

    const expectedBody = '(x + 2)';

    t.is(body.toString(), expectedBody);
});

test('functions can be called and return the correct result', (t) => {
    const callTests = [
        {
            input: 'let identity = fn(x) { x; }; identity(5);',
            expected: 5,
        },
        {
            input: 'let identity = fn(x) { return x; }; identity(5);',
            expected: 5,
        },
        {
            input: 'let double = fn(x) { x * 2; }; double(5);',
            expected: 10,
        },
        {
            input: 'let double = fn(x) { return x * 2; }; double(5);',
            expected: 10,
        },
        {
            input: 'let add = fn(x, y) { x + y }; add(5, 5);',
            expected: 10,
        },
        {
            input: 'let add = fn(x, y) { x + y }; add(5 + 5, add(5, 5));',
            expected: 20,
        },
        {
            input: 'fn(x) { x; }(5)',
            expected: 5,
        },
        {
            input: 'fn(x) { return x; }(5)',
            expected: 5,
        },
    ];

    for (const test of callTests) {
        const result = new Evaluator(test.input).evaluate();

        t.true(result instanceof Integer);
        t.is(result?.value, test.expected);
    }
});

test('function closures work properly', (t) => {
    const input = `
        let newAdder = fn(x) {
            fn(y) { x + y };
        }

        let addTwo = newAdder(2);
        addTwo(9);
        `;

    const result = new Evaluator(input).evaluate();

    t.true(result instanceof Integer);
    t.is(result?.value, 11);
});
