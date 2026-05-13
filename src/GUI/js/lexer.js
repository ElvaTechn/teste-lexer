'use strict';

import { definirEstado } from './ui.js';

/* ══════════════════════════════════════
   COMUNICAÇÃO COM O BACKEND
   ══════════════════════════════════════ */

export async function tokenizar(codigoFonte) {
  try {
    const resposta = await fetch('/api/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: codigoFonte }),
    });
    if (!resposta.ok) throw new Error(`Erro do servidor: ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    definirEstado('Erro ao contactar o servidor', 'err');
      console.error('Error contacting server:', erro);
    return {
      tokens: [],
      errors: [{ msg: erro.message, lexema: '', linha: 0, coluna: 0 }],
    };
  }
}

/* ══════════════════════════════════════
   RENDERIZAÇÃO DOS TOKENS
   ══════════════════════════════════════ */

export function renderizarTokens(tokens) {
  const semDados = document.getElementById('tokens-empty');
  const tabela   = document.getElementById('token-table');
  const corpo    = document.getElementById('token-body');
  corpo.innerHTML = '';

  if (!tokens.length) {
    semDados.style.display = 'flex';
    tabela.style.display   = 'none';
    return;
  }

  semDados.style.display = 'none';
  tabela.style.display   = 'table';

  const fragmento = document.createDocumentFragment();
  tokens.forEach(t => {
    const line = t.line ?? t.linha ?? 0;
    const col = t.col ?? t.coluna ?? 0;
    const lexeme = t.lexeme ?? t.lexema ?? '';
    const tokenClass = t.type ?? t.class ?? t.classe ?? '';
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td class="td-ln">${line}</td>
      <td class="td-ln">${col}</td>
      <td class="td-lexema">${escaparHtml(lexeme)}</td>
      <td><span class="td-classe cls-${tokenClass}">${tokenClass}</span></td>`;
    fragmento.appendChild(linha);
  });
  corpo.appendChild(fragmento);
}

/* ══════════════════════════════════════
   RENDERIZAÇÃO DOS ERROS
   ══════════════════════════════════════ */

export function renderizarErros(erros) {
  const lista = document.getElementById('errors-list');
  lista.innerHTML = '';

  if (!erros.length) {
    lista.innerHTML = `
      <div class="empty" id="errors-empty">
        <div class="empty-icon">✓</div>
        <div>Nenhum erro detectado</div>
      </div>`;
    return;
  }

  erros.forEach(e => {
    const line = e.line ?? e.linha ?? 0;
    const col = e.col ?? e.coluna ?? 0;
    const msg = e.msg ?? e.message ?? '';
    const lexeme = e.lexema ?? e.lexeme ?? e.token ?? '';
    const sugestao = e.sugestao ?? e.suggestion ?? '';

    const item = document.createElement('div');
    item.className = 'item-erro';
    item.innerHTML = `
      <div class="icone-erro">⚠</div>
      <div class="texto-erro">
        <div class="titulo-erro">Linha ${line}, Col ${col} — ${escaparHtml(msg)}</div>
        <div class="desc-erro">Lexema: <code>${escaparHtml(lexeme)}</code></div>
        ${sugestao
          ? `<div class="sugestao-erro">💡 ${escaparHtml(sugestao)}</div>`
          : ''}
      </div>`;
    lista.appendChild(item);
  });
}

/* ══════════════════════════════════════
   UTILITÁRIO
   ══════════════════════════════════════ */

function escaparHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}