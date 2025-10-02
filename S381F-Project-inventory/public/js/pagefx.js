(function(){
  const D = 100;
  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.body.classList.remove('is-leaving');
      requestAnimationFrame(() => document.body.classList.add('is-ready'));
    }
  });
  function leave(next){
    const done = () => { cleanup(); next(); };
    const cleanup = () => {
      document.body.removeEventListener('transitionend', onEnd);
      clearTimeout(tid);
    };
    const onEnd = (ev) => {
      if (ev.target === document.body && ev.propertyName === 'opacity') done();
    };
    document.body.addEventListener('transitionend', onEnd);
    const tid = setTimeout(done, D + 30);
    document.body.classList.add('is-leaving');
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest('a');
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.hash && url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    leave(() => { location.href = url.href; });
  }, false);
  document.addEventListener('submit', (e) => {
    if (e.defaultPrevented) return;
    const form = e.target;
    if (form.target && form.target !== '_self') return;
    if (form.matches && form.matches('.query-form')) return;
    e.preventDefault();
    leave(() => form.submit());
  }, false);
})();