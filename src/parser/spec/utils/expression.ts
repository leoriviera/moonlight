import { ExecutionContext } from 'ava';

import {
    BooleanLiteral,
    Expression,
    Identifier,
    Infix,
    IntegerLiteral,
} from '../../../ast';

interface Stringable {
    toString(): string;
}

export const testLiteralExpression = (
    t: ExecutionContext,
    e: Expression,
    value: Stringable
) => {
    const isIdentifier = e instanceof Identifier;
    const isIntegerLiteral = e instanceof IntegerLiteral;
    const isBooleanLiteral = e instanceof BooleanLiteral;

    if (!isIdentifier && !isIntegerLiteral && !isBooleanLiteral) {
        t.fail(`No test for ${e?.constructor.name}`);
        return;
    }

    t.is(e.value, value);
    t.is(e.token.value, value.toString());
};

export const testInfixExpression = (
    t: ExecutionContext,
    e: Infix,
    left: Stringable,
    operator: string,
    right: Stringable
) => {
    testLiteralExpression(t, e.left, left);
    t.is(e.operator, operator);
    testLiteralExpression(t, e.right, right);
};
