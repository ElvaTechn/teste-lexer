# main.py (exemplo de uso)
from lexer import Lexer

# Teste com um programa mini-Pascal simples
codigo_teste = """
program Teste;
var 
    x, y: integer;
begin
    x := 10;
    y := 20;
    if x < y then
        write(x);
    while x > 0 do
        x := x - 1
end.
"""

# Código com erros para testar recuperação
codigo_com_erros = """
program @Errado;
var
    nome: char;
begin
    nome := '@';
    write(nome)
end.
"""

def testar_lexer(codigo, nome_teste):
    print(f"\n{'='*80}")
    print(f"TESTE: {nome_teste}")
    print(f"{'='*80}")
    
    lexer = Lexer(codigo)
    tokens, erros = lexer.tokenize()
    
    lexer.print_tokens()
    
    print(f"\nResumo: {len(tokens)} tokens, {len(erros)} erros")

if __name__ == "__main__":
    testar_lexer(codigo_teste, "Programa Válido")
    testar_lexer(codigo_com_erros, "Programa com Erros")