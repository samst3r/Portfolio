/* ── NAV ── */
document.getElementById('nav-icon')?.addEventListener('click', () => {
  window.location.href = './index.html';
});
document.getElementById('nav-contact')?.addEventListener('click', () => {
  document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════
   PROJECT MODAL
   ══════════════════════════════════════════ */
const modal    = document.getElementById('project-modal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');
const mImg     = document.getElementById('modal-img');
const mImgWrap = document.getElementById('modal-img-wrap');
const mTitle   = document.getElementById('modal-title');
const mTags    = document.getElementById('modal-tags');
const mDesc    = document.getElementById('modal-desc');

function openModal(card) {
  const { title, desc, tags, img } = card.dataset;

  mTitle.textContent = title || '';
  mDesc.textContent  = desc  || '';

  mTags.innerHTML = (tags || '').split(',').map(t =>
    `<span>${t.trim()}</span>`
  ).join('');

  if (img) {
    mImg.src = img;
    mImg.alt = title || '';
    mImgWrap.classList.remove('no-img');
  } else {
    mImg.src = '';
    mImgWrap.classList.add('no-img');
  }

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-preview').forEach(card => {
  card.addEventListener('click', () => openModal(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
  });
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
});

closeBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
