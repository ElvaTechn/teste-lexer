# lexer/__init__.py
"""
Módulo responsável pela análise léxica do mini-Pascal.
Exporta as classes principais para uso externo.
"""

from .token import Token, TokenType
from .lexer import Lexer
from .error_handler import ErrorHandler

# Define o que será exportado com "from lexer import *"
__all__ = ['Token', 'TokenType', 'Lexer', 'ErrorHandler']