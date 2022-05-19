import { Token } from './tokens';

export type Identifier = {
    token: Token;
    value: string;
};

export type IntegerLiteral = {
    token: Token;
    value: number;
};

export type Prefix = {
    token: Token;
    operator: string;
    right: Expression;
};

export type Infix = {
    token: Token;
    operator: string;
    left: Expression;
    right: Expression;
};

export type Expression = Identifier | IntegerLiteral | Prefix | Infix | null;

export type LetStatement<T = Expression> = {
    token: Token;
    name: Identifier;
    value: T;
};

export type ReturnStatement<T = Expression> = {
    token: Token;
    returnValue: T;
};

export type ExpressionStatement<T = Expression> = {
    token: Token;
    expression: T;
};

export type Statement = LetStatement | ReturnStatement | ExpressionStatement;

export type Program = {
    statements: Statement[];
};
