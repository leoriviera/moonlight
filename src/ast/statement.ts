import { Token } from '../lexer/tokens';

import { Expression, Identifier } from './expression';

export interface Statement {
    token: Token;
}

export class LetStatement<T = Expression> implements Statement {
    token: Token;
    name: Identifier;
    value: T;

    constructor(token: Token, name: Identifier, value: T) {
        this.token = token;
        this.name = name;
        this.value = value;
    }

    toString(): string {
        return `${this.token} ${this.name} = ${this.value}`;
    }
}

export class ReturnStatement<T = Expression> implements Statement {
    token: Token;
    returnValue: T;

    constructor(token: Token, returnValue: T) {
        this.token = token;
        this.returnValue = returnValue;
    }

    toString(): string {
        return `${this.token} ${this.returnValue}`;
    }
}

export class ExpressionStatement<T = Expression> implements Statement {
    token: Token;
    expression: T;

    constructor(token: Token, expression: T) {
        this.token = token;
        this.expression = expression;
    }

    toString(): string {
        return `${this.expression}`;
    }
}

export class BlockStatement implements Statement {
    token: Token;
    statements: Statement[];

    constructor(token: Token, statements: Statement[]) {
        this.token = token;
        this.statements = statements;
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n');
    }
}

export class Program {
    statements: Statement[];

    constructor(statements?: Statement[]) {
        this.statements = statements ?? [];
    }

    addStatement(s: Statement): void {
        this.statements.push(s);
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n');
    }
}
