# token.py
from enum import Enum
from dataclasses import dataclass

class TokenType(Enum):
    # Palavras reservadas
    PROGRAM = "PROGRAM"
    VAR = "VAR"
    ARRAY = "ARRAY"
    OF = "OF"
    BEGIN = "BEGIN"
    END = "END"
    IF = "IF"
    THEN = "THEN"
    ELSE = "ELSE"
    WHILE = "WHILE"
    DO = "DO"
    READ = "READ"
    WRITE = "WRITE"
    TRUE = "TRUE"
    FALSE = "FALSE"
    
    # Tipos
    INTEGER = "INTEGER"
    CHAR = "CHAR"
    BOOLEAN = "BOOLEAN"
    
    # Identificadores e constantes
    IDENTIFIER = "IDENTIFIER"
    INT_CONST = "INT_CONST"
    CHAR_CONST = "CHAR_CONST"
    
    # Operadores relacionais
    EQUAL = "EQUAL"           # =
    NOT_EQUAL = "NOT_EQUAL"   # <>
    LESS = "LESS"             # <
    LESS_EQUAL = "LESS_EQUAL" # <=
    GREATER = "GREATER"       # >
    GREATER_EQUAL = "GREATER_EQUAL" # >=
    
    # Operadores lógicos
    OR = "OR"
    AND = "AND"
    NOT = "NOT"
    
    # Operadores aritméticos
    PLUS = "PLUS"     # +
    MINUS = "MINUS"   # -
    MULTIPLY = "MULTIPLY"  # *
    DIV = "DIV"       # div
    
    # Delimitadores
    ASSIGN = "ASSIGN"       # :=
    SEMICOLON = "SEMICOLON" # ;
    COLON = "COLON"         # :
    DOT = "DOT"             # .
    COMMA = "COMMA"         # ,
    LPAREN = "LPAREN"       # (
    RPAREN = "RPAREN"       # )
    LBRACKET = "LBRACKET"   # [
    RBRACKET = "RBRACKET"   # ]
    DOTDOT = "DOTDOT"       # ..
    
    # Erro
    ERROR = "ERROR"
    EOF = "EOF"


@dataclass
class Token:
    type: TokenType
    lexeme: str
    line: int
    column: int
    
    def __str__(self):
        return f"Token({self.type.value}, '{self.lexeme}', line={self.line}, col={self.column})"