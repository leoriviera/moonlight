import test from 'ava';

import { Lexer } from './lexer';
import { Token, tokenList } from './tokens';

test('test lexer with symbols', (t) => {
    const input = '=+(){},;';

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.PLUS, '+'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.SEMICOLON, ';'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('text lexer with whitespace and keywords', (t) => {
    const input = `let seven = 7;
let fourteen = 14;

let add = fn(x, y) {
    x + y;
};

let result = add(seven, fourteen);
`;
    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '7'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '14'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.FUNCTION, 'fn'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.PLUS, '+'),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'result'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.SEMICOLON, ';'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('test lexer with keywords, with no semicolons', (t) => {
    const input = `let seven = 7
let fourteen = 14`;

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '7'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '14'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('test lexer with additional operators', (t) => {
    const input = `let seven = 7;
let fourteen = 14;

let add = fn(x, y) {
    x + y;
};

let result = add(seven, fourteen);
!-/*5;

5 < 15 > 5;
`;

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '7'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '14'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.FUNCTION, 'fn'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.PLUS, '+'),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'result'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.BANG, '!'),
        new Token(tokenList.MINUS, '-'),
        new Token(tokenList.SLASH, '/'),
        new Token(tokenList.ASTERISK, '*'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.LESS_THAN, '<'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.GREATER_THAN, '>'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('test lexer with additional keywords', (t) => {
    const input = `let seven = 7;
let fourteen = 14;

let add = fn(x, y) {
    x + y;
};

let result = add(seven, fourteen);
!-/*5;

5 < 15 > 5;

if(5 < 15){
    return true;
} else {
    return false;
}
`;

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '7'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '14'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.FUNCTION, 'fn'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.PLUS, '+'),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'result'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.BANG, '!'),
        new Token(tokenList.MINUS, '-'),
        new Token(tokenList.SLASH, '/'),
        new Token(tokenList.ASTERISK, '*'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.LESS_THAN, '<'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.GREATER_THAN, '>'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.IF, 'if'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.LESS_THAN, '<'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.RETURN, 'return'),
        new Token(tokenList.TRUE, 'true'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.ELSE, 'else'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.RETURN, 'return'),
        new Token(tokenList.FALSE, 'false'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('test lexer with equality and inequality operator', (t) => {
    const input = `let seven = 7;
let fourteen = 14;

let add = fn(x, y) {
    x + y;
};

let result = add(seven, fourteen);
!-/*5;

5 < 15 > 5;

if(5 < 15){
    return true;
} else {
    return false;
}

15 == 15;
25 != 15;
`;

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '7'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.INTEGER, '14'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.FUNCTION, 'fn'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.IDENTIFIER, 'x'),
        new Token(tokenList.PLUS, '+'),
        new Token(tokenList.IDENTIFIER, 'y'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.LET, 'let'),
        new Token(tokenList.IDENTIFIER, 'result'),
        new Token(tokenList.ASSIGN, '='),
        new Token(tokenList.IDENTIFIER, 'add'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.IDENTIFIER, 'seven'),
        new Token(tokenList.COMMA, ','),
        new Token(tokenList.IDENTIFIER, 'fourteen'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.BANG, '!'),
        new Token(tokenList.MINUS, '-'),
        new Token(tokenList.SLASH, '/'),
        new Token(tokenList.ASTERISK, '*'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.LESS_THAN, '<'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.GREATER_THAN, '>'),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.IF, 'if'),
        new Token(tokenList.LEFT_PARENTHESIS, '('),
        new Token(tokenList.INTEGER, '5'),
        new Token(tokenList.LESS_THAN, '<'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.RIGHT_PARENTHESIS, ')'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.RETURN, 'return'),
        new Token(tokenList.TRUE, 'true'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.ELSE, 'else'),
        new Token(tokenList.LEFT_BRACE, '{'),
        new Token(tokenList.RETURN, 'return'),
        new Token(tokenList.FALSE, 'false'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.RIGHT_BRACE, '}'),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.EQUALS, '=='),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.SEMICOLON, ';'),
        new Token(tokenList.INTEGER, '25'),
        new Token(tokenList.NOT_EQUALS, '!='),
        new Token(tokenList.INTEGER, '15'),
        new Token(tokenList.SEMICOLON, ';'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});

test('read integer expressions with no spaces separating digits', (t) => {
    const input = `3*4;`;

    const l = new Lexer(input);

    const expectedTokens = [
        new Token(tokenList.INTEGER, '3'),
        new Token(tokenList.ASTERISK, '*'),
        new Token(tokenList.INTEGER, '4'),
        new Token(tokenList.SEMICOLON, ';'),
    ];

    const tokens = l.lexInput();
    t.deepEqual(tokens, expectedTokens);
});
