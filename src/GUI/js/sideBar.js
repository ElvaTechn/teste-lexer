'use strict';

import { FS, fsFind, fsGetFile, fsAllFiles } from './file_system.js';
import { actualizarNumeroLinhas } from './editor.js';
import { limparResultados } from './ui.js';
import { tokenizar } from './lexer.js';
import { mostrarMenuContexto } from './contextMenu.js';

/* ══════════════════════════════════════
   ESTADO DA SIDEBAR
   ══════════════════════════════════════ */

let idFicheiroActivo = FS.activeId;

export function obterFicheiroActivo() { return idFicheiroActivo; }
export function definirFicheiroActivo(id) { idFicheiroActivo = id; }

/* ══════════════════════════════════════
   ÍCONES
   ══════════════════════════════════════ */

function obterIconeFicheiro(nome) {
  if (nome.endsWith('.pas') || nome.endsWith('.pp')) return '📄';
  if (nome.endsWith('.md'))  return '📝';
  if (nome.endsWith('.txt')) return '🗒️';
  return '📃';
}

/* ══════════════════════════════════════
   RENDERIZAÇÃO DA ÁRVORE
   ══════════════════════════════════════ */

function renderizarArvoreLegado(nos = FS.tree, contentor = document.getElementById('file-tree'), profundidade = 0) {
  if (profundidade === 0) contentor.innerHTML = '';

  for (const no of nos) {
    const item = document.createElement('div');
    item.className = [
      'tree-item',
      no.type === 'folder' ? 'folder' : '',
      no.id === idFicheiroActivo ? 'active' : '',
    ].join(' ').trim();
    
    // Define o recuo visual (padding-left)
    item.style.paddingLeft = `${(profundidade * 12) + 12}px`;
    item.dataset.id = no.id;

    const icone = no.type === 'folder'
      ? (no.open ? '▼' : '▶') // Setas estilo VS Code
      : obterIconeFicheiro(no.name);

    const iconePasta = no.type === 'folder' ? (no.open ? '📂' : '📁') : '';

    item.innerHTML = `
      <span class="item-icon-arrow">${no.type === 'folder' ? icone : ''}</span>
      <span class="item-icon">${no.type === 'folder' ? iconePasta : icone}</span>
      <span class="item-name">${escaparHtml(no.name)}</span>`;

    item.addEventListener('click', () => aoClicarArvore(no));
    item.addEventListener('contextmenu', e => mostrarMenuContexto(e, no.id));
    contentor.appendChild(item);

    if (no.type === 'folder' && no.open && no.children) {
      // Cria um container para o grupo de filhos para poder desenhar a linha vertical
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      // A linha vertical fica posicionada com base na profundidade
      childrenContainer.style.marginLeft = `${(profundidade * 12) + 18}px`; 
      childrenContainer.style.borderLeft = '1px solid var(--border)';
      contentor.appendChild(childrenContainer);
      
      // Renderiza os filhos DENTRO do novo container, mas com profundidade ajustada
      // para não duplicar o padding lateral no JS
      renderizarArvore(no.children, childrenContainer, 0.5); // 0.5 é um truque para manter a linha mas ajustar o padding
    }
  }
}

// Versão melhorada do renderizador para suportar linhas infinitas
export function renderizarArvoreVSCode(nos = FS.tree, contentor = document.getElementById('file-tree'), profundidade = 0) {
  if (profundidade === 0) contentor.innerHTML = '';

  for (const no of nos) {
    const item = document.createElement('div');
    item.className = [
      'tree-item',
      no.type === 'folder' ? 'folder' : '',
      no.id === idFicheiroActivo ? 'active' : '',
    ].join(' ').trim();
    
    item.style.paddingLeft = `${(profundidade * 16) + 10}px`;
    item.dataset.id = no.id;

    const seta = no.type === 'folder' ? (no.open ? '▼' : '▶') : '';
    const icone = no.type === 'folder' ? (no.open ? '📂' : '📁') : obterIconeFicheiro(no.name);

    item.innerHTML = `
      <span class="item-arrow">${seta}</span>
      <span class="item-icon">${icone}</span>
      <span class="item-name">${escaparHtml(no.name)}</span>`;

    item.addEventListener('click', () => aoClicarArvore(no));
    item.addEventListener('contextmenu', e => mostrarMenuContexto(e, no.id));
    contentor.appendChild(item);

    if (no.type === 'folder' && no.open && no.children) {
      // No estilo VS Code, a linha vertical é desenhada por um container
      const childrenGroup = document.createElement('div');
      childrenGroup.className = 'tree-group';
      // O segredo das linhas verticais do VS Code
      childrenGroup.style.borderLeft = '1px solid #ffffff15';
      childrenGroup.style.marginLeft = `${(profundidade * 16) + 16}px`;
      contentor.appendChild(childrenGroup);
      
      // Renderiza os filhos com profundidade 0 relativa ao novo grupo (o padding é controlado pelo grupo)
      renderizarFilhos(no.children, childrenGroup, 0); 
    }
  }
}

function renderizarFilhos(nos, contentor, profundidade) {
    for (const no of nos) {
        const item = document.createElement('div');
        item.className = ['tree-item', no.type === 'folder' ? 'folder' : '', no.id === idFicheiroActivo ? 'active' : ''].join(' ').trim();
        item.style.paddingLeft = `12px`; // Padding fixo relativo à linha vertical
        
        const seta = no.type === 'folder' ? (no.open ? '▼' : '▶') : '';
        const icone = no.type === 'folder' ? (no.open ? '📂' : '📁') : obterIconeFicheiro(no.name);

        item.innerHTML = `
          <span class="item-arrow">${seta}</span>
          <span class="item-icon">${icone}</span>
          <span class="item-name">${escaparHtml(no.name)}</span>`;

        item.addEventListener('click', () => aoClicarArvore(no));
        item.addEventListener('contextmenu', e => mostrarMenuContexto(e, no.id));
        contentor.appendChild(item);

        if (no.type === 'folder' && no.open && no.children) {
            const subGroup = document.createElement('div');
            subGroup.className = 'tree-group';
            subGroup.style.borderLeft = '1px solid #ffffff15';
            subGroup.style.marginLeft = `18px`; 
            contentor.appendChild(subGroup);
            renderizarFilhos(no.children, subGroup, 0);
        }
    }
}

// Substituir a original pela versão VS Code
export const renderizarArvoreOriginal = renderizarArvoreLegado;
export { renderizarArvoreVSCode as renderizarArvore };

/* ══════════════════════════════════════
   CLIQUE NA ÁRVORE
   ══════════════════════════════════════ */

export function aoClicarArvore(no) {
  if (no.type === 'folder') {
    no.open = !no.open;
    renderizarArvoreVSCode();
    return;
  }

  const ficheiroActual = fsGetFile(idFicheiroActivo);
  if (ficheiroActual) ficheiroActual.content = document.getElementById('code-input').value;

  idFicheiroActivo = no.id;
  document.getElementById('code-input').value = no.content || '';
  document.getElementById('active-file-label').textContent = no.name;
  actualizarNumeroLinhas();
  limparResultados();
  renderizarArvoreVSCode();
}

/* ══════════════════════════════════════
   MENU DE CONTEXTO
   ══════════════════════════════════════ */

export function obterIdAlvoContexto() {
    return window.ctxTargetId;
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
