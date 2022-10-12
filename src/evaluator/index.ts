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

    #isTruthy(o: IObject): boolean {
        if (
            o === Evaluator.#references.null ||
            o === Evaluator.#references.false
        ) {
            return false;
        }

        return true;
    }

    #createError(errorType: ErrorTypes, ...args: string[]) {
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

        return new Err(messageFn(args));
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
            return this.#createError('UNKNOWN_OPERATOR', '-', right.type);
        }

        if (!(right instanceof Integer)) {
            return Evaluator.#references.null;
        }

        return new Integer(-right.value);
    }

    #convertToBooleanObject(b: boolean): IObject {
        return b ? Evaluator.#references.true : Evaluator.#references.false;
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
            '<': (l, r) => this.#convertToBooleanObject(l < r),
            '>': (l, r) => this.#convertToBooleanObject(l > r),
            '==': (l, r) => this.#convertToBooleanObject(l === r),
            '!=': (l, r) => this.#convertToBooleanObject(l !== r),
        };

        const evaluatorFn =
            operatorMap[operator] ??
            (() =>
                this.#createError(
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
            return this.#createError(
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
                '==': (l, r) => this.#convertToBooleanObject(l === r),
                '!=': (l, r) => this.#convertToBooleanObject(l !== r),
            };

        const evaluatorFn =
            operatorMap[operator] ??
            (() =>
                this.#createError(
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
            (() => this.#createError('UNKNOWN_OPERATOR', operator, right.type));

        return evaluatorFn(right);
    }

    #evaluateIfStatement(conditional: If): IObject {
        const condition = this.#evaluateNode(conditional.condition);
        if (condition instanceof Err) {
            return condition;
        }

        const { consequence, alternative } = conditional;

        if (this.#isTruthy(condition)) {
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
            return this.#createError('UNDEFINED_IDENTIFIER', identifier);
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

            if (result instanceof Err) {
                return result;
            }
        }

        return result;
    }

    #evaluateExpressions(n: Expression[]): IObject[] {
        const result: IObject[] = [];

        for (const e of n) {
            const evaluated = this.#evaluateNode(e);
            if (evaluated instanceof Err) {
                return [evaluated];
            }

            result.push(evaluated);
        }

        return result;
    }

    #callFunction(fn: IObject, args: IObject[]): IObject {
        if (!(fn instanceof Fn)) {
            return this.#createError('NOT_FUNCTION', fn.type);
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
            if (value instanceof Err) {
                return value;
            }

            this.environment.set(n.name.value, value);
        }

        if (n instanceof ReturnStatement) {
            const value = this.#evaluateNode(n.returnValue);
            if (value instanceof Err) {
                return value;
            }
            return new Return(value);
        }

        if (n instanceof Prefix) {
            const { operator } = n;

            const right = this.#evaluateNode(n.right);
            if (right instanceof Err) {
                return right;
            }

            return this.#evaluatePrefixExpression(operator, right);
        }

        if (n instanceof Infix) {
            const { operator } = n;

            const left = this.#evaluateNode(n.left);
            if (left instanceof Err) {
                return left;
            }

            const right = this.#evaluateNode(n.right);
            if (right instanceof Err) {
                return right;
            }

            return this.#evaluateInfixExpression(operator, left, right);
        }

        if (n instanceof FunctionLiteral) {
            const { parameters, body } = n;

            if (parameters === null) {
                return this.#createError(
                    'INVALID_FUNCTION_PARAMETERS',
                    n.token.value
                );
            }

            return new Fn(parameters, body, this.environment);
        }

        if (n instanceof CallExpression) {
            const fn = this.#evaluateNode(n.fn);
            if (fn instanceof Err) {
                return fn;
            }

            if (n.args === null) {
                return this.#createError(
                    'INVALID_FUNCTION_PARAMETERS',
                    n.token.value
                );
            }

            const args = this.#evaluateExpressions(n.args);
            if (args.length === 1 && args[0] instanceof Err) {
                return args[0];
            }

            return this.#callFunction(fn, args);
        }

        if (n instanceof IntegerLiteral) {
            return new Integer(n.value);
        }

        if (n instanceof BooleanLiteral) {
            return this.#convertToBooleanObject(n.value);
        }

        return Evaluator.#references.null;
    }

    evaluate(): IObject | null {
        const { statements } = this.program;

        if (statements.length === 0) {
            return null;
        }

        for (const node of statements) {
            this.#evaluateNode(node);
        }

        return this.#evaluateNode(this.program);
    }
}
