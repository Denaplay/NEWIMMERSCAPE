(function initLegalDocumentModal() {
  'use strict';

  const modal = document.createElement('div');
  modal.className = 'legal-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="legal-modal-backdrop" data-legal-close></div>
    <section class="legal-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="legalModalTitle">
      <button class="legal-modal-close" type="button" aria-label="Закрыть документ" data-legal-close>×</button>
      <h2 id="legalModalTitle">Документ</h2>
      <div class="legal-modal-content" id="legalModalContent"></div>
    </section>`;
  document.body.appendChild(modal);

  const title = modal.querySelector('#legalModalTitle');
  const content = modal.querySelector('#legalModalContent');
  const closeButton = modal.querySelector('.legal-modal-close');
  let trigger = null;
  let requestNumber = 0;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function renderInline(value) {
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r/g, '').split('\n');
    const output = [];
    let listItems = [];

    function flushList() {
      if (!listItems.length) return;
      output.push(`<ul>${listItems.map(item => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      listItems = [];
    }

    lines.forEach(line => {
      const listMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      if (listMatch) {
        listItems.push(listMatch[1]);
        return;
      }
      flushList();
      const headingMatch = line.match(/^\s*(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length + 2, 5);
        output.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      } else if (line.trim()) {
        output.push(`<p>${renderInline(line.trim())}</p>`);
      }
    });
    flushList();
    return output.join('') || '<p class="legal-modal-empty">Документ пока не заполнен.</p>';
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('legal-modal-open');
    trigger?.focus();
    trigger = null;
  }

  async function openModal(link) {
    trigger = link;
    const currentRequest = ++requestNumber;
    title.textContent = link.dataset.legalTitle || link.textContent.trim() || 'Документ';
    content.innerHTML = '<p class="legal-modal-loading">Загрузка…</p>';
    modal.hidden = false;
    document.body.classList.add('legal-modal-open');
    closeButton.focus();

    try {
      const documentUrl = link.dataset.legalUrl || link.href;
      const response = await fetch(documentUrl, {
        cache: 'no-store',
        headers: { Accept: 'text/markdown, text/plain' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      if (currentRequest === requestNumber) content.innerHTML = renderMarkdown(markdown);
    } catch (error) {
      console.error('Не удалось загрузить юридический документ:', error);
      if (currentRequest === requestNumber) content.innerHTML = '<p class="legal-modal-error">Не удалось загрузить документ. Попробуйте ещё раз.</p>';
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-legal-document]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    openModal(link);
  }, true);

  modal.querySelectorAll('[data-legal-close]').forEach(element => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || modal.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeModal();
  }, true);
})();
