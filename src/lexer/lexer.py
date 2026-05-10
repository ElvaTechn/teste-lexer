# lexer.py
from token import Token, TokenType

class Lexer:
    def __init__(self, source_code: str):
        self.source = source_code
        self.length = len(source_code)
        self.pos = 0
        self.line = 1
        self.col = 1
        self.current_char = self.source[0] if self.length > 0 else None
        
        # Palavras reservadas
        self.keywords = {
            'program': TokenType.PROGRAM,
            'var': TokenType.VAR,
            'array': TokenType.ARRAY,
            'of': TokenType.OF,
            'begin': TokenType.BEGIN,
            'end': TokenType.END,
            'if': TokenType.IF,
            'then': TokenType.THEN,
            'else': TokenType.ELSE,
            'while': TokenType.WHILE,
            'do': TokenType.DO,
            'read': TokenType.READ,
            'write': TokenType.WRITE,
            'true': TokenType.TRUE,
            'false': TokenType.FALSE,
            'integer': TokenType.INTEGER,
            'char': TokenType.CHAR,
            'boolean': TokenType.BOOLEAN,
            'div': TokenType.DIV,
            'or': TokenType.OR,
            'and': TokenType.AND,
            'not': TokenType.NOT,
        }
        
        # Lista de tokens e erros
        self.tokens = []
        self.errors = []
    
    def advance(self):
        """Avança para o próximo caractere"""
        if self.pos < self.length - 1:
            self.pos += 1
            self.col += 1
            self.current_char = self.source[self.pos]
        else:
            self.pos = self.length
            self.current_char = None
    
    def peek(self):
        """Olha o próximo caractere sem avançar"""
        if self.pos + 1 < self.length:
            return self.source[self.pos + 1]
        return None
    
    def skip_whitespace(self):
        """Pula espaços, tabs e novas linhas"""
        while self.current_char and self.current_char.isspace():
            if self.current_char == '\n':
                self.line += 1
                self.col = 0
            self.advance()
    
    def read_identifier_or_keyword(self):
        """Lê identificador ou palavra reservada"""
        start_col = self.col
        start_line = self.line
        result = ''
        
        while self.current_char and (self.current_char.isalnum() or self.current_char == '_'):
            result += self.current_char
            self.advance()
        
        # Verifica se é palavra reservada
        token_type = self.keywords.get(result.lower(), TokenType.IDENTIFIER)
        
        return Token(token_type, result, start_line, start_col)
    
    def read_number(self):
        """Lê constante inteira"""
        start_col = self.col
        start_line = self.line
        result = ''
        
        while self.current_char and self.current_char.isdigit():
            result += self.current_char
            self.advance()
        
        return Token(TokenType.INT_CONST, result, start_line, start_col)
    
    def read_char_constant(self):
        """Lê constante caractere: 'a' ou 'abc'"""
        start_col = self.col
        start_line = self.line
        self.advance()  # Pula a aspa inicial
        result = ''
        
        while self.current_char and self.current_char != "'":
            result += self.current_char
            self.advance()
        
        if self.current_char == "'":
            self.advance()  # Pula a aspa final
        else:
            self.add_error("Unterminated character constant", start_line, start_col)
        
        return Token(TokenType.CHAR_CONST, result, start_line, start_col)
    
    def read_special_symbol(self):
        """Lê símbolos especiais (operadores, delimitadores)"""
        start_col = self.col
        start_line = self.line
        char = self.current_char
        next_char = self.peek()
        
        # Símbolos de dois caracteres
        if char == ':' and next_char == '=':
            self.advance()
            self.advance()
            return Token(TokenType.ASSIGN, ':=', start_line, start_col)
        
        if char == '<' and next_char == '>':
            self.advance()
            self.advance()
            return Token(TokenType.NOT_EQUAL, '<>', start_line, start_col)
        
        if char == '<' and next_char == '=':
            self.advance()
            self.advance()
            return Token(TokenType.LESS_EQUAL, '<=', start_line, start_col)
        
        if char == '>' and next_char == '=':
            self.advance()
            self.advance()
            return Token(TokenType.GREATER_EQUAL, '>=', start_line, start_col)
        
        if char == '.' and next_char == '.':
            self.advance()
            self.advance()
            return Token(TokenType.DOTDOT, '..', start_line, start_col)
        
        # Símbolos de um caractere
        symbols = {
            '+': TokenType.PLUS,
            '-': TokenType.MINUS,
            '*': TokenType.MULTIPLY,
            '=': TokenType.EQUAL,
            '<': TokenType.LESS,
            '>': TokenType.GREATER,
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            '.': TokenType.DOT,
            ',': TokenType.COMMA,
            ';': TokenType.SEMICOLON,
            ':': TokenType.COLON,
        }
        
        if char in symbols:
            self.advance()
            return Token(symbols[char], char, start_line, start_col)
        
        # Símbolo inválido
        self.add_error(f"Invalid character: '{char}'", start_line, start_col)
        self.advance()
        return Token(TokenType.ERROR, char, start_line, start_col)
    
    def add_error(self, message, line, col):
        """Adiciona erro à lista de erros léxicos"""
        self.errors.append({
            'message': message,
            'line': line,
            'column': col
        })
    
    def get_next_token(self):
        """Retorna o próximo token do código fonte"""
        if not self.current_char:
            return Token(TokenType.EOF, '', self.line, self.col)
        
        # Pula whitespace
        if self.current_char.isspace():
            self.skip_whitespace()
            return self.get_next_token()
        
        # Identificador ou palavra reservada (letra ou underscore)
        if self.current_char.isalpha() or self.current_char == '_':
            return self.read_identifier_or_keyword()
        
        # Número
        if self.current_char.isdigit():
            return self.read_number()
        
        # Constante caractere
        if self.current_char == "'":
            return self.read_char_constant()
        
        # Símbolos especiais
        return self.read_special_symbol()
    
    def tokenize(self):
        """Executa a análise léxica completa, com recuperação de erros"""
        self.tokens = []
        self.errors = []
        
        while True:
            token = self.get_next_token()
            self.tokens.append(token)
            
            if token.type == TokenType.EOF:
                break
            
            # Se token for erro, continua mesmo assim (recuperação)
            if token.type == TokenType.ERROR:
                continue
        
        return self.tokens, self.errors
    
    def print_tokens(self):
        """Exibe os tokens de forma formatada (para debug)"""
        print("\n" + "="*80)
        print("TOKENS ENCONTRADOS:")
        print("="*80)
        for token in self.tokens:
            print(token)
        
        if self.errors:
            print("\n" + "="*80)
            print("ERROS LÉXICOS:")
            print("="*80)
            for error in self.errors:
                print(f"Linha {error['line']}, Coluna {error['column']}: {error['message']}")