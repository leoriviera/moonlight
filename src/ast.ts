import { Token } from './tokens';

export type Identifier = {
    type: Token;
    value: string;
};

export type IntegerLiteral = {
    type: Token;
    value: number;
};

export type Expression = Identifier | IntegerLiteral;

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
