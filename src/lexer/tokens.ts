export const tokenList = {
    ILLEGAL: 'ILLEGAL',
    EOF: 'EOF',

    // Identifiers and literals
    IDENTIFIER: 'IDENTIFIER',
    INTEGER: 'INTEGER',
    STRING: 'STRING',

    // Operators
    ASSIGN: '=',
    PLUS: '+',
    MINUS: '-',
    BANG: '!',
    ASTERISK: '*',
    SLASH: '/',
    LESS_THAN: '<',
    GREATER_THAN: '>',
    EQUALS: '==',
    NOT_EQUALS: '!=',

    // Delimiters
    COMMA: ',',
    SEMICOLON: ';',

    // Parentheses
    LEFT_PARENTHESIS: '(',
    RIGHT_PARENTHESIS: ')',
    LEFT_BRACE: '{',
    RIGHT_BRACE: '}',

    // Keywords
    FUNCTION: 'FUNCTION',
    LET: 'LET',
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    IF: 'IF',
    ELSE: 'ELSE',
    RETURN: 'RETURN',
};

export const keywords: Record<string, TokenType> = {
    fn: tokenList.FUNCTION,
    let: tokenList.LET,
    true: tokenList.TRUE,
    false: tokenList.FALSE,
    if: tokenList.IF,
    else: tokenList.ELSE,
    return: tokenList.RETURN,
};

export type TokenType = string;

export const lookupIdentifier = (identifier: string): TokenType =>
    keywords[identifier] ?? tokenList.IDENTIFIER;

export class Token {
    type: TokenType;
    value: string;

    constructor(type: TokenType, value: string) {
        this.type = type;
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}
