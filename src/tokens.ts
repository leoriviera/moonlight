type TokenType = string;

export type Token = {
    type: TokenType;
    value: string;
};

export const tokenList = {
    ILLEGAL: 'ILLEGAL',
    EOF: 'EOF',

    // Identifiers and literals
    IDENTIFIER: 'IDENTIFIER',
    INTEGER: 'INTEGER',

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

export const keywords: Record<string, string> = {
    fn: tokenList.FUNCTION,
    let: tokenList.LET,
    true: tokenList.TRUE,
    false: tokenList.FALSE,
    if: tokenList.IF,
    else: tokenList.ELSE,
    return: tokenList.RETURN,
};

export const lookupIdentifier = (identifier: string): TokenType =>
    keywords[identifier] ?? tokenList.IDENTIFIER;
