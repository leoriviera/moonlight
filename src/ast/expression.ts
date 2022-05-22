import { Token } from '../tokens';

export interface Expression {
    token: Token;
    toString(): string;
}

export class Identifier implements Expression {
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

export class IntegerLiteral implements Expression {
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

export class Prefix implements Expression {
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

export class Infix implements Expression {
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