// NAV: Hamburger menu – clean & stable
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('ks-header');
  const btn    = document.getElementById('ks-hamburger');
  const drawer = document.getElementById('ks-drawer');
  if (!header || !btn || !drawer) return;

  // Calculate top offset for mobile drawer
  const setOffset = ()=>{
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--ks-offset', `${h}px`);
  };
  setOffset(); addEventListener('resize', setOffset);

  // Backdrop (once)
  let backdrop = document.querySelector('.ks-backdrop');
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'ks-backdrop';
    document.body.appendChild(backdrop);
  }

  const open = ()=>{
    drawer.classList.add('ks-open');
    btn.classList.add('ks-active');
    btn.setAttribute('aria-expanded','true');
    backdrop.classList.add('ks-show');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = ()=>{
    drawer.classList.remove('ks-open');
    btn.classList.remove('ks-active');
    btn.setAttribute('aria-expanded','false');
    backdrop.classList.remove('ks-show');
    document.documentElement.style.overflow = '';
  };
  const toggle = ()=> drawer.classList.contains('ks-open') ? close() : open();

  btn.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));

  // Active page highlight (auto)
  const current = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('a').forEach(a=>{
    a.removeAttribute('aria-current');
    if (a.getAttribute('href') === current) a.setAttribute('aria-current','page');
  });

  // Close on Escape
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && drawer.classList.contains('ks-open')) close();
  });
});
