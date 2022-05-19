import { Token } from './tokens';

type Expression = string;

type Identifier = {
    type: Token;
    value: string;
};

export type LetStatement = {
    token: Token;
    name: Identifier;
    value: Expression;
};

export type ReturnStatement = {
    token: Token;
    returnValue: Expression;
};

export type Statement = LetStatement | ReturnStatement;

export type Program = {
    statements: Statement[];
};
