// ============================================================
// ACADEMIA JOTA RUBIO — Page-specific interactions
// Funciones para hacer funcionar todos los botones de la UI
// ============================================================

// ── IA.HTML: Nuevo caso ──────────────────────────────────
function newCaseIA() {
  const input = document.querySelector('.ia-input input, .ia-input textarea');
  if (input) {
    input.value = '';
    input.focus();
    showToast('Nuevo caso iniciado. Describí el problema', 'info', 2500);
  } else {
    showToast('Nuevo caso iniciado', 'info', 2500);
  }
}

// ── IA.HTML: Analizar ────────────────────────────────────
async function runAnalysis() {
  const input = document.querySelector('.ia-input input, .ia-input textarea');
  if (!input || !input.value.trim()) {
    showToast('Describí primero el problema', 'warning');
    return;
  }

  // Mostrar estado "analizando"
  const btn = event.target;
  const origText = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analizando...';

  showToast('Analizando tu caso...', 'info', 2000);

  // Simular delay de IA
  await new Promise(r => setTimeout(r, 1800));

  btn.disabled = false;
  btn.innerHTML = origText;

  showToast('Análisis completo. Revisa el diagnóstico', 'success', 3000);

  // Si hay un contenedor de resultado, agregar texto de demo
  const result = document.querySelector('.ia-result, .ia-output, #iaResult');
  if (result) {
    result.innerHTML = `
      <div class="ia-msg ia-msg-bot">
        <div class="ia-msg-avatar">🤖</div>
        <div class="ia-msg-bubble">
          <strong>Diagnóstico IA (demo):</strong><br>
          Detecté 3 posibles causas para tu caso. La más probable: <strong>${Math.random() > 0.5 ? 'falla en el circuito de carga' : 'IC táctil dañado'}</strong> (${Math.floor(Math.random() * 30 + 60)}% probabilidad).<br><br>
          <em>Pasos sugeridos: medir voltaje en C2014, revisar continuidad en D2401, considerar reball del U2600 si persiste.</em>
        </div>
      </div>
    `;
  }
}

// ── LIVE.HTML: Seguir / Dejar de seguir ─────────────────
function toggleSeguir(btn) {
  if (btn.classList.contains('following')) {
    btn.classList.remove('following');
    btn.textContent = '+ Seguir';
    btn.style.background = 'var(--accent)';
    showToast('Dejaste de seguir', 'info', 2000);
  } else {
    btn.classList.add('following');
    btn.textContent = '✓ Siguiendo';
    btn.style.background = 'var(--success)';
    showToast('Ahora seguís a este canal', 'success', 2000);
  }
}

// ── LIVE.HTML: Recordar transmisión ─────────────────────
function toggleRec(btn) {
  if (btn.classList.contains('recording')) {
    btn.classList.remove('recording');
    btn.textContent = '🔔 Recordar';
    showToast('Recordatorio eliminado', 'info', 2000);
  } else {
    btn.classList.add('recording');
    btn.textContent = '🔔 Te lo recordamos';
    showToast('Te avisaremos 10 min antes', 'success', 2500);
  }
}

// ── LIVE.HTML: Compartir ─────────────────────────────────
function shareLive() {
  if (navigator.share) {
    navigator.share({
      title: 'Transmisión en vivo · Academia Jota Rubio',
      text: 'Mirá esta transmisión en vivo',
      url: window.location.href
    }).then(() => showToast('Compartido ✓', 'success', 2000))
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }

  function fallbackCopy() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copiado al portapapeles ✓', 'success', 2500))
      .catch(() => showToast('No se pudo copiar', 'error', 2500));
  }
}

// ── LIVE.HTML: Enviar mensaje de chat ───────────────────
function sendChat() {
  const input = document.querySelector('.chat-input-field, .chat-input input, .chat-input-area input, .chat-input-area textarea');
  if (!input) {
    showToast('Input no encontrado', 'error');
    return;
  }
  const text = input.value.trim();
  if (!text) {
    showToast('Escribí un mensaje', 'warning');
    return;
  }

  const chat = document.querySelector('.chat-messages, .chat-msgs');
  if (chat) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.innerHTML = `
      <div class="chat-msg-avatar" style="background: linear-gradient(135deg, var(--accent), var(--success));">${(Auth.getCurrentUser()?.fullName || 'Yo').charAt(0).toUpperCase()}</div>
      <div class="chat-msg-body">
        <div class="chat-msg-author">Vos</div>
        <div class="chat-msg-text">${text.replace(/</g, '&lt;')}</div>
      </div>
    `;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  input.value = '';
  showToast('Mensaje enviado ✓', 'success', 1500);
}

// ── PERFIL.HTML: Seguir usuario ─────────────────────────
function toggleSeguirPerfil(btn) {
  if (btn.classList.contains('following')) {
    btn.classList.remove('following');
    btn.textContent = '🔔 Seguir';
    showToast('Dejaste de seguir', 'info', 2000);
  } else {
    btn.classList.add('following');
    btn.textContent = '✓ Siguiendo';
    showToast('Ahora seguís a este técnico', 'success', 2000);
  }
}

// ── PLANES.HTML: Billing toggle ─────────────────────────
function setBilling(tipo) {
  const buttons = document.querySelectorAll('.billing-toggle button, [class*="billing"] button');
  buttons.forEach(b => {
    b.style.background = 'var(--bg-tertiary)';
    b.style.color = 'var(--text-secondary)';
  });
  event.target.style.background = 'var(--accent)';
  event.target.style.color = 'white';

  // Cambiar precios (demo)
  const precios = document.querySelectorAll('.plan-amount, .plan-price');
  precios.forEach(p => {
    if (tipo === 'anual') {
      p.dataset.original = p.dataset.original || p.textContent;
      p.textContent = '$' + Math.floor(parseInt(p.textContent.replace(/[^0-9]/g, '')) * 10) + '/año';
    } else {
      if (p.dataset.original) p.textContent = p.dataset.original;
    }
  });

  showToast('Plan ' + (tipo === 'anual' ? 'anual' : 'mensual') + ' seleccionado', 'info', 2000);
}

// ── DASHBOARD.HTML: Filtros de catálogo ─────────────────
function filterCatalogo(cat) {
  showToast('Filtrando por: ' + cat, 'info', 1500);
}

// ── Genericos: Links a "#" que no son del footer ────────
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href="#"]');
  if (link && !link.onclick) {
    e.preventDefault();
    const text = link.textContent.trim();
    if (text) showToast('"' + text + '" - próximamente', 'info', 2500);
  }
});
