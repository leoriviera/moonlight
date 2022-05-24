import { Token } from '../tokens';

import { BlockStatement } from './statement';

interface IExpression {
    token: Token;
    toString(): string;
}

export type Expression = IExpression | null;

export class Identifier implements IExpression {
    token: Token;
    value: string;

    constructor(token: Token) {
        this.token = token;
        this.value = token.value;
    }

    toString(): string {
        return this.value;
    }
}

export class BooleanLiteral implements IExpression {
    token: Token;
    value: boolean;

    constructor(token: Token) {
        this.token = token;
        this.value = token.value === 'true';
    }

    toString(): string {
        return this.value.toString();
    }
}

export class IntegerLiteral implements IExpression {
    token: Token;
    value: number;

    constructor(token: Token) {
        this.token = token;
        this.value = Number.parseInt(token.value, 10);
    }

    toString(): string {
        return this.value.toString();
    }
}

export class Prefix implements IExpression {
    token: Token;
    operator: string;
    right: Expression;

    constructor(token: Token, right: Expression) {
        this.token = token;
        this.operator = token.value;
        this.right = right;
    }

    toString(): string {
        return `(${this.operator}${this.right})`;
    }
}

export class Infix implements IExpression {
    token: Token;
    operator: string;
    left: Expression;
    right: Expression;

    constructor(token: Token, left: Expression, right: Expression) {
        this.token = token;
        this.operator = token.value;
        this.left = left;
        this.right = right;
    }

    toString(): string {
        return `(${this.left} ${this.operator} ${this.right})`;
    }
}

export class If implements IExpression {
    token: Token;
    condition: Expression;
    consequence: BlockStatement;
    alternative: BlockStatement | null;

    constructor(
        token: Token,
        condition: Expression,
        consequence: BlockStatement,
        alternative: BlockStatement | null = null
    ) {
        this.token = token;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }

    toString(): string {
        return `${this.token.toString()} ${this.condition} ${this.consequence}${
            this.alternative !== null ? ' else ' + this.alternative : ''
        }`;
    }
}

export class FunctionLiteral implements IExpression {
    token: Token;
    parameters: Identifier[] | null;
    body: BlockStatement;

    constructor(
        token: Token,
        parameters: Identifier[] | null,
        body: BlockStatement
    ) {
        this.token = token;
        this.parameters = parameters;
        this.body = body;
    }

    toString(): string {
        return `fn(${this.parameters?.join(', ')}) ${this.body}`;
    }
}
