import { BlockStatement, Identifier } from '../ast';

import { Environment } from './environment';

export const objectList = {
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    RETURN: 'RETURN',
    FUNCTION: 'FUNCTION',
    ERROR: 'ERROR',
};

type ObjectType = typeof objectList[keyof typeof objectList];

export interface IObject {
    type: ObjectType;
    value: unknown;
    toString: () => string;
}

export class Integer implements IObject {
    type = objectList.INTEGER;
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class Bool implements IObject {
    type = objectList.BOOLEAN;
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class Null implements IObject {
    type = objectList.NULL;
    value = null;

    toString(): string {
        return 'null';
    }
}

export class Return implements IObject {
    type = objectList.RETURN;
    value: IObject;

    constructor(value: IObject) {
        this.value = value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class Fn implements IObject {
    type = objectList.FUNCTION;
    value: {
        params: Identifier[];
        body: BlockStatement;
        env: Environment;
    };

    constructor(params: Identifier[], body: BlockStatement, env: Environment) {
        this.value = {
            params,
            body,
            env,
        };
    }

    toString() {
        const { params, body } = this.value;

        return `fn(${params.join(', ')}) {\n${body.toString()}\n}`;
    }
}

export type ErrorTypes =
    | 'UNKNOWN_OPERATOR'
    | 'UNDEFINED_IDENTIFIER'
    | 'TYPE_MISMATCH'
    | 'INVALID_FUNCTION_PARAMETERS'
    | 'NOT_FUNCTION';

export class Err implements IObject {
    type = objectList.ERROR;
    value: string;

    constructor(value: string) {
        this.value = value;
    }

    toString(): string {
        return `An error occurred: ${this.value}`;
    }
}
