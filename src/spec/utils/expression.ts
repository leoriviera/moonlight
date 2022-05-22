import { ExecutionContext } from 'ava';

import {
    BooleanLiteral,
    Expression,
    Identifier,
    IntegerLiteral,
} from '../../ast';

const testIdentifier = (t: ExecutionContext, i: Identifier, value: string) => {
    t.is(i.value, value);
    t.is(i.token.value, value);
};

const testIntegerLiteral = (
    t: ExecutionContext,
    i: IntegerLiteral,
    value: number
) => {
    t.is(i.value, value);
    t.is(i.token.value, value.toString());
};

const testBooleanLiteral = (
    t: ExecutionContext,
    b: BooleanLiteral,
    value: boolean
) => {
    t.is(b.value, value);
    t.is(b.token.value, value.toString());
};

export const testLiteralExpression = (
    t: ExecutionContext,
    e: Expression,
    value: unknown
) => {
    if (e instanceof Identifier) {
        testIdentifier(t, e, value as string);
        return;
    }

    if (e instanceof IntegerLiteral) {
        testIntegerLiteral(t, e, value as number);
        return;
    }

    if (e instanceof BooleanLiteral) {
        testBooleanLiteral(t, e, value as boolean);
        return;
    }

    t.fail(`No test for ${e?.constructor.name}`);
};
