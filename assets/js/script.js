// Mobil menü
const toggle = document.querySelector('.nav-toggle');
const list = document.querySelector('.nav-list');
if (toggle && list) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('show');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
