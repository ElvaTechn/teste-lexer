import json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import sys
import os
import webbrowser
import threading
import time

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return Path(base_path) / relative_path

if getattr(sys, 'frozen', False):
    GUI_DIR = get_resource_path('GUI')
    sys.path.insert(0, str(get_resource_path('')))
else:
    GUI_DIR = Path(__file__).parent / 'GUI'
    sys.path.insert(0, str(Path(__file__).parent))

from lexer.lexer import Lexer

class BackendHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(GUI_DIR), **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/tokenize':
            self.handle_tokenize()
        elif self.path == '/api/ask-ai':
            self.handle_ask_ai()
        else:
            self.send_error(404)

    def handle_tokenize(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            payload = json.loads(body)
            source = payload.get('source', '')
            lexer = Lexer(source)
            tokens, errors = lexer.tokenize()
            
            response = json.dumps({
                'tokens': [{'linha': t.line, 'coluna': t.column, 'lexema': t.lexeme, 'classe': t.type.value} for t in tokens],
                'errors': [{'msg': e.get('message',''), 'lexema': e.get('token',''), 'linha': e.get('line',0), 'coluna': e.get('column',0), 'sugestao': e.get('suggestion','')} for e in errors]
            }).encode('utf-8')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response)
        except Exception as e:
            self.send_error(500, str(e))

    def handle_ask_ai(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            payload = json.loads(body)
            question = payload.get('question', '')
            answer = f"Como assistente UEM, analisei: '{question}'. Verifique a sintaxe mini-Pascal cuidadosamente."
            response = json.dumps({'answer': answer}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response)
        except Exception as e:
            self.send_error(500, str(e))

if __name__ == '__main__':
    PORT = 8000
    url = f'http://127.0.0.1:{PORT}'
    server = ThreadingHTTPServer(('127.0.0.1', PORT), BackendHandler)
    print(f'Servidor mini-Pascal iniciado em {url}')
    
    # Abertura robusta do navegador
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(url)
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.server_close()
