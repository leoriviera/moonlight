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
        [tokenList.LEFT_PARENTHESIS]: Precedence.CALL,
    };

    #tokenParsers = {
        [tokenList.LET]: () => this.#parseLetStatement(),
        [tokenList.RETURN]: () => this.#parseReturnStatement(),
    };

    #prefixParsers: Record<string, PrefixParseFunction> = {
        [tokenList.IDENTIFIER]: () => this.#parseIdentifier(),
        [tokenList.TRUE]: () => this.#parseBoolean(),
        [tokenList.FALSE]: () => this.#parseBoolean(),
        [tokenList.INTEGER]: () => this.#parseIntegerLiteral(),
        [tokenList.BANG]: () => this.#parsePrefixExpression(),
        [tokenList.MINUS]: () => this.#parsePrefixExpression(),
        [tokenList.LEFT_PARENTHESIS]: () => this.#parseGroupedExpression(),
        [tokenList.IF]: () => this.#parseIfExpression(),
        [tokenList.FUNCTION]: () => this.#parseFunctionLiteral(),
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
        [tokenList.LEFT_PARENTHESIS]: (l: Expression) =>
            this.#parseCallExpression(l as Identifier | FunctionLiteral),
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

        return new Identifier(identifier);
    }

    #parseBoolean(): BooleanLiteral {
        const { currentToken: boolean } = this;

        return new BooleanLiteral(boolean);
    }

    #parseCallArguments(): Expression[] | null {
        const args: Expression[] = [];

        if (this.#isNextToken(tokenList.RIGHT_PARENTHESIS)) {
            this.#advance();
            return args;
        }

        this.#advance();

        args.push(this.#parseExpression(Precedence.LOWEST));

        while (this.#isNextToken(tokenList.COMMA)) {
            this.#advance();
            this.#advance();

            args.push(this.#parseExpression(Precedence.LOWEST));
        }

        if (!this.#advanceIfNextToken(tokenList.RIGHT_PARENTHESIS)) {
            return null;
        }

        return args;
    }

    #parseCallExpression(fn: FunctionLiteral | Identifier): CallExpression {
        const { currentToken: call } = this;

        const args = this.#parseCallArguments();

        return new CallExpression(call, fn, args);
    }

    #parseGroupedExpression(): Expression {
        this.#advance();

        const e = this.#parseExpression(Precedence.LOWEST);

        if (!this.#advanceIfNextToken(tokenList.RIGHT_PARENTHESIS)) {
            return null;
        }

        return e;
    }

    #parsePrefixExpression(): Prefix {
        const { currentToken: prefix } = this;

        this.#advance();

        const right = this.#parseExpression(Precedence.PREFIX);

        const e = new Prefix(prefix, right);

        return e;
    }

    #parseInfixExpression(left: Expression): Infix {
        const { currentToken: infix } = this;

        const precedence = this.#currentPrecedence();
        this.#advance();
        const right = this.#parseExpression(precedence);

        return new Infix(infix, left, right);
    }

    #parseFunctionParameters(): Identifier[] | null {
        const identifiers: Identifier[] = [];

        if (this.#isNextToken(tokenList.RIGHT_PARENTHESIS)) {
            this.#advance();
            return identifiers;
        }

        this.#advance();

        identifiers.push(new Identifier(this.currentToken));

        while (this.#isNextToken(tokenList.COMMA)) {
            this.#advance();
            this.#advance();

            identifiers.push(new Identifier(this.currentToken));
        }

        if (!this.#advanceIfNextToken(tokenList.RIGHT_PARENTHESIS)) {
            return null;
        }

        return identifiers;
    }

    #parseFunctionLiteral(): FunctionLiteral | null {
        const { currentToken: fn } = this;

        if (!this.#advanceIfNextToken(tokenList.LEFT_PARENTHESIS)) {
            return null;
        }

        const parameters = this.#parseFunctionParameters();

        if (!this.#advanceIfNextToken(tokenList.LEFT_BRACE)) {
            return null;
        }

        const body = this.#parseBlockStatement();

        return new FunctionLiteral(fn, parameters, body);
    }

    #parseIntegerLiteral(): IntegerLiteral {
        const { currentToken: integer } = this;

        return new IntegerLiteral(integer);
    }

    #parseBlockStatement(): BlockStatement {
        const { currentToken: leftBrace } = this;

        const statements: Statement[] = [];

        this.#advance();

        while (
            !this.#isCurrentToken(tokenList.RIGHT_BRACE) &&
            !this.#isCurrentToken(tokenList.EOF)
        ) {
            const statement = this.#parseStatement();

            if (statement) {
                statements.push(statement);
            }

            this.#advance();
        }

        return new BlockStatement(leftBrace, statements);
    }

    #parseIfExpression(): If | null {
        const { currentToken: ifToken } = this;

        if (!this.#advanceIfNextToken(tokenList.LEFT_PARENTHESIS)) {
            return null;
        }

        this.#advance();

        const condition = this.#parseExpression(Precedence.LOWEST);

        if (!this.#advanceIfNextToken(tokenList.RIGHT_PARENTHESIS)) {
            return null;
        }

        if (!this.#advanceIfNextToken(tokenList.LEFT_BRACE)) {
            return null;
        }

        const consequence = this.#parseBlockStatement();

        let alternative: BlockStatement | null = null;

        if (this.#isNextToken(tokenList.ELSE)) {
            this.#advance();

            if (!this.#advanceIfNextToken(tokenList.LEFT_BRACE)) {
                return null;
            }

            alternative = this.#parseBlockStatement();
        }

        return new If(ifToken, condition, consequence, alternative);
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

        this.#advance();

        const value = this.#parseExpression(Precedence.LOWEST);

        if (this.#isNextToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return new LetStatement(letToken, new Identifier(identifier), value);
    }

    #parseReturnStatement(): ReturnStatement {
        const { currentToken: returnToken } = this;

        this.#advance();

        const value = this.#parseExpression(Precedence.LOWEST);

        if (this.#isNextToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return new ReturnStatement(returnToken, value);
    }

    #parseExpressionStatement(): ExpressionStatement {
        const { currentToken: expressionToken } = this;

        const expression = this.#parseExpression(Precedence.LOWEST);

        const s = new ExpressionStatement(expressionToken, expression);

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
        this.program = new Program();

        while (this.currentToken.type !== tokenList.EOF) {
            const statement = this.#parseStatement();

            if (statement) {
                this.program.addStatement(statement);
            }

            this.#advance();
        }

        return this.program;
    }
}
