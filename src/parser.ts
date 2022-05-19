import {
    Expression,
    ExpressionStatement,
    Identifier,
    IntegerLiteral,
    LetStatement,
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
    tokenParsers = {
        [tokenList.LET]: () => this.#parseLetStatement(),
        [tokenList.RETURN]: () => this.#parseReturnStatement(),
    };

    prefixParsers: Record<string, PrefixParseFunction> = {
        [tokenList.IDENTIFIER]: () => this.#parseIdentifier(),
        [tokenList.INTEGER]: () => this.#parseIntegerLiteral(),
    };

    infixParsers: Record<string, InfixParseFunction> = {};

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
        return this.currentToken?.type === type;
    }

    #isNextToken(type: TokenType): boolean {
        return this.nextToken?.type === type;
    }

    #advanceIfNextToken(type: TokenType): boolean {
        if (this.#isNextToken(type)) {
            this.#advance();
            return true;
        }

        const { line, column } = this.#getCurrentPosition();

        const error = `Expected next token to be ${type}, got ${this.nextToken?.type} instead. (${line}:${column})`;
        this.errors.push(error);
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

    #parseIdentifier(): Identifier {
        const { currentToken: identifier } = this;

        return {
            type: identifier,
            value: identifier.value,
        };
    }

    #parseIntegerLiteral(): IntegerLiteral {
        const { currentToken: integer } = this;

        const value = parseInt(integer.value, 10);

        return {
            type: integer,
            value,
        };
    }

    #parseExpression(p: Precedence): Expression {
        console.log(p);

        const prefixParser = this.prefixParsers[this.currentToken?.type];

        if (!prefixParser) {
            return {
                type: {
                    type: '',
                    value: '',
                },
                value: '',
            };
        }

        return prefixParser();
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
                type: identifier,
                value: identifier.value,
            },
            value: {
                type: {
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
                type: {
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
        const statementType = this.currentToken?.type;

        if (!statementType) {
            return null;
        }

        const handleParse = this.tokenParsers[statementType];

        if (!handleParse) {
            return this.#parseExpressionStatement();
        }

        return handleParse();
    }

    parseProgram(): Program | null {
        this.program = {
            statements: [],
        };

        while (this.currentToken?.type !== tokenList.EOF) {
            const statement = this.#parseStatement();

            if (statement) {
                this.program.statements.push(statement);
            }

            this.#advance();
        }

        return this.program;
    }
}
