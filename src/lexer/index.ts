import { lookupIdentifier, Token, tokenList } from './tokens';

export class Lexer {
    static #tokenMap = new Map([
        ['=', tokenList.ASSIGN],
        ['+', tokenList.PLUS],
        ['-', tokenList.MINUS],
        ['!', tokenList.BANG],
        ['*', tokenList.ASTERISK],
        ['/', tokenList.SLASH],
        ['<', tokenList.LESS_THAN],
        ['>', tokenList.GREATER_THAN],
        [',', tokenList.COMMA],
        [';', tokenList.SEMICOLON],
        ['(', tokenList.LEFT_PARENTHESIS],
        [')', tokenList.RIGHT_PARENTHESIS],
        ['{', tokenList.LEFT_BRACE],
        ['}', tokenList.RIGHT_BRACE],
        ['"', tokenList.STRING],
        [null, tokenList.EOF],
    ]);

    input: string;
    position: number;
    readPosition: number;
    character: string | null;
    segments: IterableIterator<Intl.SegmentData>;

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.readPosition = 0;
        this.character = null;
        this.segments = new Intl.Segmenter().segment(input)[Symbol.iterator]();

        this.#readSegment();
    }

    static isValidCharacter(character: string | null) {
        const characterRegex = /[\p{Letter}\p{Emoji}]/u;

        return character !== null && characterRegex.test(character);
    }

    static isNumber(character: string) {
        const numberRegex = /\p{Number}/u;

        return numberRegex.test(character);
    }

    #consumeWhitespace(): void {
        const whitespaceRegex = /\p{White_Space}/u;

        while (whitespaceRegex.test(this.character as string)) {
            this.#readSegment();
        }
    }

    #readSegment(): void {
        const currentSegment = this.segments.next();

        if (currentSegment.done) {
            this.character = null;
        } else {
            this.character = currentSegment.value.segment;
        }

        this.position = this.readPosition;
        this.readPosition += currentSegment?.value?.segment.length ?? 0;
    }

    #readIdentifier(): string {
        const { position } = this;

        while (Lexer.isValidCharacter(this.character)) {
            this.#readSegment();
        }

        return this.input.slice(position, this.position);
    }

    #readNumber(): string {
        const { position } = this;

        while (Lexer.isNumber(this.character as string)) {
            this.#readSegment();
        }

        return this.input.slice(position, this.position);
    }

    #readString(): string {
        const stringParts = [];

        this.#readSegment();

        while (this.character !== '"') {
            if (this.character === '\\') {
                stringParts.push(this.character);
                this.#readSegment();
            }

            if (this.character === null) {
                throw new Error('"');
            }

            stringParts.push(this.character);
            this.#readSegment();
        }

        this.#readSegment();

        return stringParts.join('').replaceAll(/\\[a-z"\\]/g, (v) => {
            const character = v.charAt(1);
            // Convert the escaped character to a C escape sequence.
            switch (character) {
                case '0':
                    return '\0';
                case 'b':
                    return '\b';
                case 'f':
                    return '\f';
                case 'n':
                    return '\n';
                case 'r':
                    return '\r';
                case 't':
                    return '\t';
                case 'v':
                    return '\v';
            }
            return character;
        });
    }

    #peekCharacter(): string | null {
        return this.input.charAt(this.readPosition);
    }

    nextToken(): Token {
        this.#consumeWhitespace();

        const { character } = this;

        const t = Lexer.#tokenMap.get(character);

        if (t) {
            try {
                if (character === '"') {
                    const value = this.#readString();

                    return new Token(t, value);
                }
            } catch (e) {
                this.#readSegment();
                return new Token(tokenList.ILLEGAL, (e as Error).message);
            }

            if (character === '=' || character === '!') {
                const peekedCharacter = this.#peekCharacter();

                if (peekedCharacter === '=') {
                    this.#readSegment();
                    this.#readSegment();

                    const type =
                        character === '='
                            ? tokenList.EQUALS
                            : tokenList.NOT_EQUALS;
                    const value = character + peekedCharacter;

                    return new Token(type, value);
                }
            }

            this.#readSegment();
            return new Token(t, character ?? '');
        }

        // As the Emoji unicode property (\p{Emoji}) matches numbers,
        // we check for numbers first.
        if (Lexer.isNumber(character as string)) {
            const value = this.#readNumber();

            return new Token(tokenList.INTEGER, value);
        }

        if (Lexer.isValidCharacter(character as string)) {
            const value = this.#readIdentifier();

            return new Token(lookupIdentifier(value), value);
        }

        this.#readSegment();

        return new Token(tokenList.ILLEGAL, character as string);
    }

    lexInput(): Token[] {
        const tokens = [];

        let token = this.nextToken();

        while (token.type !== tokenList.EOF) {
            tokens.push(token);
            token = this.nextToken();
        }

        return tokens;
    }
}
