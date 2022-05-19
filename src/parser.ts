import {
    Expression,
    ExpressionStatement,
    Identifier,
    Infix,
    IntegerLiteral,
    LetStatement,
    Prefix,
    Program,
    ReturnStatement,
    Statement,
} from './ast';
import { Lexer } from './lexer';
import { Token, tokenList, TokenType } from './tokens';

type PrefixParseFunction = () => Expression;
type InfixParseFunction = (left: Expression) => Expression;

enum Precedence {
    LOWEST = 1, // x
    EQUALS, // x == y
    LESS_GREATER, // x > y, x < y
    SUM, // x + y
    PRODUCT, // x * y
    PREFIX, // !x or -x
    CALL, // fn(x)
}

export class Parser {
    static #precedences = {
        [tokenList.EQUALS]: Precedence.EQUALS,
        [tokenList.NOT_EQUALS]: Precedence.EQUALS,
        [tokenList.LESS_THAN]: Precedence.LESS_GREATER,
        [tokenList.GREATER_THAN]: Precedence.LESS_GREATER,
        [tokenList.PLUS]: Precedence.SUM,
        [tokenList.MINUS]: Precedence.SUM,
        [tokenList.SLASH]: Precedence.PRODUCT,
        [tokenList.ASTERISK]: Precedence.PRODUCT,
    };

    #tokenParsers = {
        [tokenList.LET]: () => this.#parseLetStatement(),
        [tokenList.RETURN]: () => this.#parseReturnStatement(),
    };

    #prefixParsers: Record<string, PrefixParseFunction> = {
        [tokenList.IDENTIFIER]: () => this.#parseIdentifier(),
        [tokenList.INTEGER]: () => this.#parseIntegerLiteral(),
        [tokenList.BANG]: () => this.#parsePrefixExpression(),
        [tokenList.MINUS]: () => this.#parsePrefixExpression(),
    };

    infixParsers: Record<string, InfixParseFunction> = {
        [tokenList.EQUALS]: (l: Expression) => this.#parseInfixExpression(l),
        [tokenList.NOT_EQUALS]: (l: Expression) =>
            this.#parseInfixExpression(l),
        [tokenList.LESS_THAN]: (l: Expression) => this.#parseInfixExpression(l),
        [tokenList.GREATER_THAN]: (l: Expression) =>
            this.#parseInfixExpression(l),
        [tokenList.PLUS]: (l: Expression) => this.#parseInfixExpression(l),
        [tokenList.MINUS]: (l: Expression) => this.#parseInfixExpression(l),
        [tokenList.SLASH]: (l: Expression) => this.#parseInfixExpression(l),
        [tokenList.ASTERISK]: (l: Expression) => this.#parseInfixExpression(l),
    };

    l: Lexer;

    currentToken: Token;
    nextToken: Token;

    errors: string[];
    program: Program | null;

    constructor(input: string) {
        this.l = new Lexer(input);

        const currentToken = this.l.nextToken();
        const nextToken = this.l.nextToken();

        this.currentToken = currentToken;
        this.nextToken = nextToken;

        this.errors = [];
        this.program = null;
    }

    #advance() {
        this.currentToken = this.nextToken;
        this.nextToken = this.l.nextToken();
    }

    #isCurrentToken(type: TokenType): boolean {
        return this.currentToken.type === type;
    }

    #isNextToken(type: TokenType): boolean {
        return this.nextToken?.type === type;
    }

    #logError(error: string) {
        const { line, column } = this.#getCurrentPosition();

        this.errors.push(`${error} (${line}:${column})`);
    }

    #advanceIfNextToken(type: TokenType): boolean {
        if (this.#isNextToken(type)) {
            this.#advance();
            return true;
        }

        this.#logError(
            `Expected next token to be ${type}, got ${this.nextToken?.type} instead.`
        );

        return false;
    }

    #getCurrentPosition(): { line: number; column: number } {
        const precedingText = this.l.input.slice(0, this.l.position ?? 0);

        const line = precedingText.split('\n').length;
        // Move back to the start of the token
        const column =
            (precedingText.split('\n').pop()?.length ?? 0) -
            (this.nextToken?.value?.length ?? 0);

        return {
            line,
            column,
        };
    }

    #nextPrecedence(): Precedence {
        const precedence = Parser.#precedences[this.nextToken?.type];

        return precedence ?? Precedence.LOWEST;
    }

    #currentPrecedence(): Precedence {
        const precedence = Parser.#precedences[this.currentToken.type];

        return precedence ?? Precedence.LOWEST;
    }

    #parseIdentifier(): Identifier {
        const { currentToken: identifier } = this;

        return {
            token: identifier,
            value: identifier.value,
        };
    }

    #parsePrefixExpression(): Prefix {
        const { currentToken: prefix } = this;

        this.#advance();

        const e: Prefix = {
            token: prefix,
            operator: prefix.value,
            right: this.#parseExpression(Precedence.PREFIX),
        };

        return e;
    }

    #parseInfixExpression(left: Expression): Infix {
        const { currentToken: infix } = this;

        const precedence = this.#currentPrecedence();
        this.#advance();
        const right = this.#parseExpression(precedence);

        const e = {
            token: infix,
            operator: infix.value,
            left,
            right,
        };

        return e;
    }

    #parseIntegerLiteral(): IntegerLiteral {
        const { currentToken: integer } = this;

        const value = parseInt(integer.value, 10);

        return {
            token: integer,
            value,
        };
    }

    #parseExpression(p: Precedence): Expression {
        const prefixParser = this.#prefixParsers[this.currentToken.type];

        if (!prefixParser) {
            this.#logError(`No prefix parser for ${this.currentToken.type}.`);
            return null;
        }

        let left = prefixParser();

        while (
            !this.#isNextToken(tokenList.SEMICOLON) &&
            p < this.#nextPrecedence()
        ) {
            const infix = this.infixParsers[this.nextToken.type];
            if (!infix) {
                return left;
            }

            this.#advance();

            left = infix(left);
        }

        return left;
    }

    #parseLetStatement(): LetStatement | null {
        const { currentToken: letToken } = this;

        if (!this.#advanceIfNextToken(tokenList.IDENTIFIER)) {
            return null;
        }

        const { currentToken: identifier } = this;

        if (!this.#advanceIfNextToken(tokenList.ASSIGN)) {
            return null;
        }

        const s: LetStatement = {
            token: letToken,
            name: {
                token: identifier,
                value: identifier.value,
            },
            value: {
                token: {
                    type: '',
                    value: '',
                },
                value: '',
            },
        };

        // TODO - implement value parsing
        while (!this.#isCurrentToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return s;
    }

    #parseReturnStatement(): ReturnStatement {
        const { currentToken: returnToken } = this;

        const s: ReturnStatement = {
            token: returnToken,
            returnValue: {
                token: {
                    type: '',
                    value: '',
                },
                value: '',
            },
        };

        // TODO - implement value parsing
        while (!this.#isCurrentToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return s;
    }

    #parseExpressionStatement(): ExpressionStatement {
        const { currentToken: expressionToken } = this;

        const expression = this.#parseExpression(Precedence.LOWEST);

        const s: ExpressionStatement = {
            token: expressionToken,
            expression,
        };

        if (this.#isNextToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return s;
    }

    #parseStatement(): Statement | null {
        const statementType = this.currentToken.type;

        if (!statementType) {
            return null;
        }

        const handleParse = this.#tokenParsers[statementType];

        if (!handleParse) {
            return this.#parseExpressionStatement();
        }

        return handleParse();
    }

    parseProgram(): Program | null {
        this.program = {
            statements: [],
        };

        while (this.currentToken.type !== tokenList.EOF) {
            const statement = this.#parseStatement();

            if (statement) {
                this.program.statements.push(statement);
            }

            this.#advance();
        }

        return this.program;
    }
}
