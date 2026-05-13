'use strict';

/* ══════════════════════════════════════
   ESTADO DO ASSISTENTE
   ══════════════════════════════════════ */

let ultimosTokens = [];
let ultimosErros  = [];

export function definirUltimosTokens(tokens) { ultimosTokens = tokens; }
export function definirUltimosErros(erros)   { ultimosErros  = erros;  }

/* ══════════════════════════════════════
   CONSTRUÇÃO DO CONTEXTO
   ══════════════════════════════════════ */

function construirContexto(codigoFonte) {
  const resumoTokens = ultimosTokens.length
    ? `Tokens (${ultimosTokens.length}):\n` +
      ultimosTokens.slice(0, 40).map(t => `  ${t.lexema} → ${t.classe} (Ln ${t.linha})`).join('\n') +
      (ultimosTokens.length > 40 ? `\n  ... e mais ${ultimosTokens.length - 40}` : '')
    : 'Nenhuma análise realizada ainda.';

  const resumoErros = ultimosErros.length
    ? `\nErros (${ultimosErros.length}):\n` +
      ultimosErros.map(e => `  Ln ${e.linha}: ${e.msg}`).join('\n')
    : '\nSem erros.';

  return `És um assistente especialista em compiladores e análise léxica para mini-Pascal.
Ajudas estudantes da Universidade Eduardo Mondlane (cadeira de Linguagens de Programação e Compiladores).
Responde em Português de Moçambique. Sê conciso e pedagógico.

Contexto actual:
Código fonte: ${codigoFonte || '(vazio)'}
${resumoTokens}${resumoErros}`;
}

/* ══════════════════════════════════════
   CRIAÇÃO DE BOLHAS
   ══════════════════════════════════════ */

function criarBolha(classe, texto) {
  const bolha = document.createElement('div');
  bolha.className = `ai-bubble ${classe}`; // Use ai-bubble from styles.css
  bolha.textContent = texto;
  return bolha;
}

/* ══════════════════════════════════════
   ENVIAR PERGUNTA
   ══════════════════════════════════════ */

export async function enviarPergunta() {
  const entrada  = document.getElementById('ai-question');
  const pergunta = entrada.value.trim();
  if (!pergunta) return;
  entrada.value = '';

  const painel = document.getElementById('ai-panel');
  const codigoFonte = document.getElementById('code-input').value.trim();

  /* bolha do utilizador */
  painel.appendChild(criarBolha('user', pergunta));

  /* bolha de carregamento */
  const bolhaResposta = criarBolha('assistant loading', 'A analisar…');
  painel.appendChild(bolhaResposta);
  painel.scrollTop = painel.scrollHeight;

  try {
    const resposta = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: pergunta,
        context: construirContexto(codigoFonte),
      }),
    });

    if (!resposta.ok) throw new Error('Erro na resposta do servidor');
    
    const dados = await resposta.json();
    const texto = dados.answer || 'Sem resposta do assistente.';
    bolhaResposta.textContent = texto;
    bolhaResposta.classList.remove('loading');

  } catch (erro) {
    bolhaResposta.textContent = 'Erro ao contactar o assistente local. Verifique se o servidor está a correr.';
    bolhaResposta.classList.remove('loading');
    bolhaResposta.classList.add('erro');
  }

  painel.scrollTop = painel.scrollHeight;
}

/* ══════════════════════════════════════
   INICIAR — Enter para enviar
   ══════════════════════════════════════ */

export function iniciarAssistente() {
  document.getElementById('ai-question').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  });
}