import test from 'ava';

import { Lexer } from './lexer';
import { tokenList } from './tokens';

test('test lexer with symbols', (t) => {
    const input = '=+(){},;';

    const l = new Lexer(input);

    const expectedTokens = [
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.PLUS, value: '+' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.EOF, value: '' },
    ];

    for (const expectedToken of expectedTokens) {
        const token = l.nextToken();

        t.deepEqual(token, expectedToken);
    }
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
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '7' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '14' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.FUNCTION, value: 'fn' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.PLUS, value: '+' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'result' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.EOF, value: '' },
    ];

    for (const expectedToken of expectedTokens) {
        const token = l.nextToken();

        t.deepEqual(token, expectedToken);
    }
});

test('test lexer with additional operators', (t) => {
    t.pass();

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
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '7' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '14' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.FUNCTION, value: 'fn' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.PLUS, value: '+' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'result' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.BANG, value: '!' },
        { type: tokenList.MINUS, value: '-' },
        { type: tokenList.SLASH, value: '/' },
        { type: tokenList.ASTERISK, value: '*' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.LESS_THAN, value: '<' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.GREATER_THAN, value: '>' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.EOF, value: '' },
    ];

    for (const expectedToken of expectedTokens) {
        const token = l.nextToken();

        t.deepEqual(token, expectedToken);
    }
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
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '7' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '14' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.FUNCTION, value: 'fn' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.PLUS, value: '+' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'result' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.BANG, value: '!' },
        { type: tokenList.MINUS, value: '-' },
        { type: tokenList.SLASH, value: '/' },
        { type: tokenList.ASTERISK, value: '*' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.LESS_THAN, value: '<' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.GREATER_THAN, value: '>' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.IF, value: 'if' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.LESS_THAN, value: '<' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.RETURN, value: 'return' },
        { type: tokenList.TRUE, value: 'true' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.ELSE, value: 'else' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.RETURN, value: 'return' },
        { type: tokenList.FALSE, value: 'false' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.EOF, value: '' },
    ];

    for (const expectedToken of expectedTokens) {
        const token = l.nextToken();

        t.deepEqual(token, expectedToken);
    }
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
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '7' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.INTEGER, value: '14' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.FUNCTION, value: 'fn' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.IDENTIFIER, value: 'x' },
        { type: tokenList.PLUS, value: '+' },
        { type: tokenList.IDENTIFIER, value: 'y' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.LET, value: 'let' },
        { type: tokenList.IDENTIFIER, value: 'result' },
        { type: tokenList.ASSIGN, value: '=' },
        { type: tokenList.IDENTIFIER, value: 'add' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.IDENTIFIER, value: 'seven' },
        { type: tokenList.COMMA, value: ',' },
        { type: tokenList.IDENTIFIER, value: 'fourteen' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.BANG, value: '!' },
        { type: tokenList.MINUS, value: '-' },
        { type: tokenList.SLASH, value: '/' },
        { type: tokenList.ASTERISK, value: '*' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.LESS_THAN, value: '<' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.GREATER_THAN, value: '>' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.IF, value: 'if' },
        { type: tokenList.LEFT_PARENTHESIS, value: '(' },
        { type: tokenList.INTEGER, value: '5' },
        { type: tokenList.LESS_THAN, value: '<' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.RIGHT_PARENTHESIS, value: ')' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.RETURN, value: 'return' },
        { type: tokenList.TRUE, value: 'true' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.ELSE, value: 'else' },
        { type: tokenList.LEFT_BRACE, value: '{' },
        { type: tokenList.RETURN, value: 'return' },
        { type: tokenList.FALSE, value: 'false' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.RIGHT_BRACE, value: '}' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.EQUALS, value: '==' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.INTEGER, value: '25' },
        { type: tokenList.NOT_EQUALS, value: '!=' },
        { type: tokenList.INTEGER, value: '15' },
        { type: tokenList.SEMICOLON, value: ';' },
        { type: tokenList.EOF, value: '' },
    ];

    for (const expectedToken of expectedTokens) {
        const token = l.nextToken();

        t.deepEqual(token, expectedToken);
    }
});
