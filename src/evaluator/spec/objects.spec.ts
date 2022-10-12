import test from 'ava';

import { Bool, Integer, Null } from '../objects';

test('integer object returns expected string output', (t) => {
    const integer = new Integer(1);
    t.is(integer.toString(), '1');
});

test('boolean object returns expected string output', (t) => {
    const trueBoolean = new Bool(true);
    t.is(trueBoolean.toString(), 'true');

    const falseBoolean = new Bool(false);
    t.is(falseBoolean.toString(), 'false');
});

test('null object returns expected string output', (t) => {
    const nullObject = new Null();
    t.is(nullObject.toString(), 'null');
});
