import { LetStatement, Program, ReturnStatement, Statement } from './ast';
import { Lexer } from './lexer';
import { Token, tokenList, TokenType } from './tokens';

export class Parser {
    parserMap = {
        [tokenList.LET]: () => this.#parseLetStatement(),
        [tokenList.RETURN]: () => this.#parseReturnStatement(),
    };

    l: Lexer;
    currentToken?: Token;
    errors: string[];
    nextToken?: Token;
    program: Program | null;

    constructor(input: string) {
        this.l = new Lexer(input);
        this.currentToken = undefined;
        this.nextToken = undefined;

        this.errors = [];
        this.program = null;

        this.#advance();
        this.#advance();
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

        console.log(this.currentToken, 'currentToken');

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

    #parseLetStatement(): LetStatement | null {
        if (!this.currentToken) {
            return null;
        }

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
            value: '',
        };

        // TODO - implement value parsing
        while (!this.#isCurrentToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return s;
    }

    #parseReturnStatement(): ReturnStatement | null {
        if (!this.currentToken) {
            return null;
        }

        const { currentToken: returnToken } = this;

        const s: ReturnStatement = {
            token: returnToken,
            returnValue: '',
        };

        // TODO - implement value parsing
        while (!this.#isCurrentToken(tokenList.SEMICOLON)) {
            this.#advance();
        }

        return s;
    }

    #parseStatement(): Statement | null {
        const statementType = this.currentToken?.type;

        if (!statementType) {
            return null;
        }

        const handleParse = this.parserMap[statementType];

        if (!handleParse) {
            return null;
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
