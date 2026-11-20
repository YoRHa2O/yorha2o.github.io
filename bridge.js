// Browser navigation only. Old media URLs embedded in players need to be replaced at the caller.
(() => {
  const home = new URL('https://yorha2o-gamedesign.pages.dev/GameDesign/');
  const old = new URL(location.href);
  function updateEntry(href, message, label) {
    function render() {
      const link = document.querySelector('main a');
      link.href = href;
      link.textContent = label;
      document.querySelector('main p').textContent = message;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render, {once: true});
    } else {
      render();
    }
  }
  const pages = new Set([
    'index', 'game-wall', 'once-human', 'portal', 'security', 'text-game', 'workflow',
    'archive', 'ai-workflow', 'ue-review', 'visitor-login'
  ]);
  const callbacks = /\/game-wall-login(?:\.html)?\/?$/i;
  function authParameters(params) {
    return [...params.keys()].some(key =>
      /^(?:code|state|access_token|id_token|refresh_token|error|error_description|code_verifier)$/i.test(key));
  }
  if (callbacks.test(old.pathname) || authParameters(old.searchParams) ||
      authParameters(new URLSearchParams(old.hash.slice(1)))) {
    history.replaceState(null, '', old.pathname);
    updateEntry(home.href, '旧站登录已结束。请从新站首页重新进入。', '打开新站首页');
    return;
  }
  if (window.top !== window.self) return;
  const prefix = '/GameDesign/';
  let route;
  if (['/', '/index.html', '/GameDesign'].includes(old.pathname)) route = '';
  else if (old.pathname.startsWith(prefix)) route = old.pathname.slice(prefix.length);
  else return;

  const page = route.replace(/\.html$/, '');
  const video = /^media\/workflow\/(?:whitebox-ai-comparison|whitebox-atlas-generated-p4r1|whitebox-atlas-generated-p9)\.mp4$/.test(route);
  const hls = /^media\/(portal|security)\/(?:index\.m3u8|part-(\d{3})\.ts)$/.exec(route);
  const segmentExists = hls && (!hls[2] || Number(hls[2]) < (hls[1] === 'portal' ? 62 : 37));
  let destination;
  if (!route || page === 'index') destination = new URL(home);
  else if (pages.has(page)) destination = new URL(page + '.html', home);
  else if (['play/zoo', 'play/zoo/', 'play/zoo/index.html'].includes(route)) destination = new URL('play/zoo/', home);
  else if (video || segmentExists) destination = new URL(route, home);
  else return;

  function keep(name, pattern) {
    const values = old.searchParams.getAll(name);
    if (values.length === 1 && pattern.test(values[0])) destination.searchParams.set(name, values[0]);
  }
  if (page === 'game-wall') {
    keep('game', /^(?:steam-\d+|switch-[a-z0-9-]+|manual-[a-f0-9-]{36})$/i);
    keep('journal', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }
  if (page === 'archive') keep('category', /^(?:commercial|prototypes|workflow)$/);
  // Simple section IDs and MP4 time fragments are public navigation data.
  if (/^#[a-z][\w-]{0,127}$/i.test(old.hash) ||
      (video && /^#t=\d+(?:\.\d+)?(?:,\d+(?:\.\d+)?)?$/.test(old.hash))) {
    destination.hash = old.hash;
  }
  updateEntry(destination.href, '若页面尚未跳转，可从下方进入。', '前往新站对应页面');
  location.replace(destination.href);
})();
