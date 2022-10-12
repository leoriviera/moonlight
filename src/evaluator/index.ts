import {
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    If,
    Infix,
    IntegerLiteral,
    IStatement,
    LetStatement,
    Node,
    Prefix,
    Program,
    ReturnStatement,
} from '../ast';
import { Parser } from '../parser';

import { Environment } from './environment';
import {
    Bool,
    Err,
    ErrorTypes,
    Fn,
    Integer,
    IObject,
    Null,
    objectList,
    Return,
} from './objects';

export class Evaluator {
    parser: Parser;
    program: Program;
    environment: Environment;
    static #references = {
        true: new Bool(true),
        false: new Bool(false),
        null: new Null(),
    };

    constructor(input: string, env?: Environment) {
        this.parser = new Parser(input);
        this.program = this.parser.parseProgram();
        this.environment = env ?? new Environment();
    }

    static #isTruthy(o: IObject): boolean {
        if (
            o === Evaluator.#references.null ||
            o === Evaluator.#references.false
        ) {
            return false;
        }

        return true;
    }

    static #throwError(errorType: ErrorTypes, ...args: string[]) {
        const messageGenerator: Record<ErrorTypes, (a: string[]) => string> = {
            UNKNOWN_OPERATOR: (a) =>
                'unknown operator: ' + a.join(a.length === 2 ? '' : ' '),
            TYPE_MISMATCH: (a) => 'type mismatch: ' + a.join(' '),
            UNDEFINED_IDENTIFIER: (a) => `identifier not found: ${a[0]}`,
            INVALID_FUNCTION_PARAMETERS: (a) =>
                `invalid function parameters: ${a[0]}`,
            NOT_FUNCTION: (a) => `not a function: ${a[0]}`,
        };

        const messageFn = messageGenerator[errorType];

        throw new Error(messageFn(args));
    }

    static #convertToBooleanObject(b: boolean): IObject {
        return b ? Evaluator.#references.true : Evaluator.#references.false;
    }

    #evaluateBangOperatorExpression(right: IObject): IObject {
        switch (right) {
            case Evaluator.#references.true: {
                return Evaluator.#references.false;
            }
            case Evaluator.#references.false: {
                return Evaluator.#references.true;
            }
            case Evaluator.#references.null: {
                return Evaluator.#references.true;
            }
            default: {
                return Evaluator.#references.false;
            }
        }
    }

    #evaluateMinusPrefixOperatorExpression(right: IObject): IObject {
        if (right.type !== objectList.INTEGER) {
            throw Evaluator.#throwError('UNKNOWN_OPERATOR', '-', right.type);
        }

        if (!(right instanceof Integer)) {
            return Evaluator.#references.null;
        }

        return new Integer(-right.value);
    }

    #evaluateIntegerInfixExpression(
        operator: string,
        left: Integer,
        right: Integer
    ): IObject {
        const operatorMap: Record<string, (l: number, r: number) => IObject> = {
            '+': (l, r) => new Integer(l + r),
            '-': (l, r) => new Integer(l - r),
            '*': (l, r) => new Integer(l * r),
            '/': (l, r) => new Integer(l / r),
            '<': (l, r) => Evaluator.#convertToBooleanObject(l < r),
            '>': (l, r) => Evaluator.#convertToBooleanObject(l > r),
            '==': (l, r) => Evaluator.#convertToBooleanObject(l === r),
            '!=': (l, r) => Evaluator.#convertToBooleanObject(l !== r),
        };

        const evaluatorFn =
            operatorMap[operator] ??
            (() =>
                Evaluator.#throwError(
                    'UNKNOWN_OPERATOR',
                    left.type,
                    operator,
                    right.type
                ));

        return evaluatorFn(left.value, right.value);
    }

    #evaluateInfixExpression(
        operator: string,
        left: IObject,
        right: IObject
    ): IObject {
        if (left.type !== right.type) {
            throw Evaluator.#throwError(
                'TYPE_MISMATCH',
                left.type,
                operator,
                right.type
            );
        }

        if (left instanceof Integer && right instanceof Integer) {
            return this.#evaluateIntegerInfixExpression(operator, left, right);
        }

        const operatorMap: Record<string, (l: unknown, r: unknown) => IObject> =
            {
                '==': (l, r) => Evaluator.#convertToBooleanObject(l === r),
                '!=': (l, r) => Evaluator.#convertToBooleanObject(l !== r),
            };

        const evaluatorFn =
            operatorMap[operator] ??
            (() =>
                Evaluator.#throwError(
                    'UNKNOWN_OPERATOR',
                    left.type,
                    operator,
                    right.type
                ));

        return evaluatorFn(left.value, right.value);
    }

    #evaluatePrefixExpression(operator: string, right: IObject): IObject {
        const operatorMap: Record<string, (r: IObject) => IObject> = {
            '!': (r: IObject) => this.#evaluateBangOperatorExpression(r),
            '-': (r: IObject) => this.#evaluateMinusPrefixOperatorExpression(r),
        };

        const evaluatorFn =
            operatorMap[operator] ??
            (() =>
                Evaluator.#throwError(
                    'UNKNOWN_OPERATOR',
                    operator,
                    right.type
                ));

        return evaluatorFn(right);
    }

    #evaluateIfStatement(conditional: If): IObject {
        const condition = this.#evaluateNode(conditional.condition);

        const { consequence, alternative } = conditional;

        if (Evaluator.#isTruthy(condition)) {
            return this.#evaluateNode(consequence);
        } else if (alternative) {
            return this.#evaluateNode(alternative);
        } else {
            return Evaluator.#references.null;
        }
    }

    #evaluateBlockStatement(s: IStatement[]): IObject {
        let result: IObject = Evaluator.#references.null;

        for (const statement of s) {
            result = this.#evaluateNode(statement);

            if (result !== Evaluator.#references.null) {
                if (
                    result.type === objectList.RETURN ||
                    result.type === objectList.ERROR
                ) {
                    return result;
                }
            }
        }

        return result;
    }

    #evaluateIdentifier(n: Identifier): IObject {
        const { value: identifier } = n;

        const value = this.environment.get(identifier);

        if (!value) {
            throw Evaluator.#throwError('UNDEFINED_IDENTIFIER', identifier);
        }

        return value;
    }

    #evaluateProgram(s: IStatement[]): IObject {
        let result: IObject = new Null();

        for (const statement of s) {
            result = this.#evaluateNode(statement);

            if (result instanceof Return) {
                return result.value;
            }
        }

        return result;
    }

    #evaluateExpressions(n: Expression[]): IObject[] {
        const result: IObject[] = [];

        for (const e of n) {
            const evaluated = this.#evaluateNode(e);

            result.push(evaluated);
        }

        return result;
    }

    #callFunction(fn: IObject, args: IObject[]): IObject {
        if (!(fn instanceof Fn)) {
            throw Evaluator.#throwError('NOT_FUNCTION', fn.type);
        }

        const { params, env } = fn.value;

        const currentEnvironment = this.environment.clone();

        const functionEnvironment = env.clone();
        const extendedEnv = new Environment(functionEnvironment);

        for (let i = 0; i < params.length; i++) {
            extendedEnv.set(params[i].value, args[i]);
        }

        this.environment = extendedEnv;

        const result = this.#evaluateNode(fn.value.body);

        this.environment = currentEnvironment;

        return result instanceof Return ? result.value : result;
    }

    #evaluateNode(n: Node): IObject {
        if (n instanceof Program) {
            return this.#evaluateProgram(n.statements);
        }

        if (n instanceof Identifier) {
            return this.#evaluateIdentifier(n);
        }

        if (n instanceof BlockStatement) {
            return this.#evaluateBlockStatement(n.statements);
        }

        if (n instanceof If) {
            return this.#evaluateIfStatement(n);
        }

        if (n instanceof ExpressionStatement) {
            return this.#evaluateNode(n.expression);
        }

        if (n instanceof LetStatement) {
            const value = this.#evaluateNode(n.value);

            this.environment.set(n.name.value, value);
        }

        if (n instanceof ReturnStatement) {
            const value = this.#evaluateNode(n.returnValue);

            return new Return(value);
        }

        if (n instanceof Prefix) {
            const { operator } = n;

            const right = this.#evaluateNode(n.right);

            return this.#evaluatePrefixExpression(operator, right);
        }

        if (n instanceof Infix) {
            const { operator } = n;

            const left = this.#evaluateNode(n.left);

            const right = this.#evaluateNode(n.right);

            return this.#evaluateInfixExpression(operator, left, right);
        }

        if (n instanceof FunctionLiteral) {
            const { parameters, body } = n;

            if (parameters === null) {
                throw Evaluator.#throwError(
                    'INVALID_FUNCTION_PARAMETERS',
                    n.token.value
                );
            }

            return new Fn(parameters, body, this.environment);
        }

        if (n instanceof CallExpression) {
            const fn = this.#evaluateNode(n.fn);

            if (n.args === null) {
                throw Evaluator.#throwError(
                    'INVALID_FUNCTION_PARAMETERS',
                    n.token.value
                );
            }

            const args = this.#evaluateExpressions(n.args);

            return this.#callFunction(fn, args);
        }

        if (n instanceof IntegerLiteral) {
            return new Integer(n.value);
        }

        if (n instanceof BooleanLiteral) {
            return Evaluator.#convertToBooleanObject(n.value);
        }

        return Evaluator.#references.null;
    }

    evaluate(): IObject | null {
        const { statements } = this.program;

        if (statements.length === 0) {
            return null;
        }

        try {
            for (const node of statements) {
                this.#evaluateNode(node);
            }

            return this.#evaluateNode(this.program);
        } catch (error) {
            const { message } = error as Error;

            return new Err(message);
        }
    }
}
