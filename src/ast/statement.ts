import { Token } from '../lexer/tokens';

import { Expression, Identifier } from './expression';

export interface IStatement {
    token: Token;
}

export class LetStatement<T = Expression> implements IStatement {
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

export class ReturnStatement<T = Expression> implements IStatement {
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

export class ExpressionStatement<T = Expression> implements IStatement {
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

export class BlockStatement implements IStatement {
    token: Token;
    statements: IStatement[];

    constructor(token: Token, statements: IStatement[]) {
        this.token = token;
        this.statements = statements;
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n');
    }
}

export class Program {
    statements: IStatement[];

    constructor(statements?: IStatement[]) {
        this.statements = statements ?? [];
    }

    addStatement(s: IStatement): void {
        this.statements.push(s);
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n');
    }
}
