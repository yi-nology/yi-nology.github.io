/* ══════════════════════════════════════════════════════════
   yi-nology.github.io — 交互层
   数据：优先 GitHub API 实时拉取，失败回落到 assets/data/org-data.json
   ══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const API = 'https://api.github.com/orgs/yi-nology/repos?per_page=100&sort=pushed';
  const SNAPSHOT = 'assets/data/org-data.json';

  const LANG_COLORS = {
    Go: '#00ADD8', Rust: '#DEA584', TypeScript: '#3178C6', Vue: '#41B883',
    Python: '#3572A5', JavaScript: '#F1E05A', Shell: '#89E051', HTML: '#E34C26',
    Makefile: '#427819', Java: '#B07219', CSS: '#563D7C', Dockerfile: '#384D54',
  };

  // 分类规则按顺序匹配，命中即止；兜底为 other
  const CATEGORIES = [
    { id: 'k8s',      label: 'Kubernetes 云原生', color: '#326CE5', test: n => /^k7s/.test(n) || n === 'iam-deploy' },
    { id: 'git',      label: 'Git 基础设施',     color: '#F05032', test: n => /^(git-|go-git)|gitcode|ferry/.test(n) },
    { id: 'agent',    label: 'Agent 与 AI',      color: '#A78BFA', test: n => /^(agent|bianque|pulse|code-review)/.test(n) },
    { id: 'pm',       label: '项目管理与发布',    color: '#F59E0B', test: n => /^zentao/.test(n) },
    { id: 'platform', label: '配置与资源平台',    color: '#06B6D4', test: n => n === 'rainbow_bridge' },
    { id: 'app',      label: '应用与站点',       color: '#34D399', test: n => /sidecar|^cv$|murphyyi|ework|go-book|resume|mdresume|film|WechatShare|yi-nology\.github\.io|^\.github$/.test(n) },
    { id: 'lib',      label: '脚手架与库',       color: '#00ADD8', test: n => /common|^sdk$|scaffold|template|[Pp]romQL|home-system|sso|wifi-qr|jsproxy|form-generator|tldr|NotionNext|uptime|^shell$/.test(n) },
    { id: 'arch',     label: '已归档',           color: '#64748B', test: () => false },
    { id: 'other',    label: '其他',             color: '#64748B', test: () => false },
  ];

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    repos: [],
    category: 'all',
    query: '',
    sort: 'pushed',
  };

  /* ── 主题 ─────────────────────────────────────────────── */
  const THEME_KEY = 'yi-nology-theme';
  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* 隐私模式忽略 */ }
  };

  const stored = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
  })();
  applyTheme(stored || 'dark');

  $('#themeToggle')?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  /* ── 导航滚动态 ───────────────────────────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── 数据加载 ─────────────────────────────────────────── */
  function normalize(r) {
    return {
      name: r.name,
      url: r.html_url || r.url || `https://github.com/yi-nology/${r.name}`,
      description: r.description || '',
      language: r.language || '',
      topics: Array.isArray(r.topics) ? r.topics : [],
      stars: r.stargazers_count ?? r.stars ?? 0,
      forks: r.forks_count ?? r.forks ?? 0,
      homepage: (r.homepage || '').trim(),
      archived: !!r.archived,
      fork: !!r.fork,
      pushedAt: r.pushed_at || r.pushedAt || '',
    };
  }

  async function loadRepos() {
    try {
      const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('empty payload');
      return { repos: data.map(normalize), live: true };
    } catch (err) {
      const res = await fetch(SNAPSHOT);
      if (!res.ok) throw err;
      const data = await res.json();
      return { repos: (data.repos || []).map(normalize), live: false };
    }
  }

  /* ── 分类 ─────────────────────────────────────────────── */
  function categoryOf(repo) {
    if (repo.archived) return 'arch';
    for (const c of CATEGORIES) {
      if (c.id === 'arch' || c.id === 'other') continue;
      if (c.test(repo.name)) return c.id;
    }
    return 'other';
  }

  /* ── 仓库目录渲染 ─────────────────────────────────────── */
  const grid = $('#repoGrid');
  const emptyState = $('#repoEmpty');
  const filtersEl = $('#repoFilters');
  const searchEl = $('#repoSearch');
  const countEl = $('#repoCount');

  function buildFilters() {
    const counts = new Map();
    state.repos.forEach((r) => counts.set(categoryOf(r), (counts.get(categoryOf(r)) || 0) + 1));

    const items = [{ id: 'all', label: '全部', color: 'var(--cyan)', count: state.repos.length }]
      .concat(CATEGORIES.filter((c) => counts.get(c.id)))
      .map((c) => {
        const count = c.id === 'all' ? state.repos.length : counts.get(c.id);
        return `<button type="button" class="filter-chip${state.category === c.id ? ' active' : ''}" data-cat="${c.id}">
          ${c.label}<span class="n">${count}</span>
        </button>`;
      });

    filtersEl.innerHTML = items.join('');
    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-chip');
      if (!btn) return;
      state.category = btn.dataset.cat;
      $$('.filter-chip', filtersEl).forEach((b) => b.classList.toggle('active', b === btn));
      renderRepos();
    });
  }

  function matches(repo) {
    if (state.category !== 'all' && categoryOf(repo) !== state.category) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    return [repo.name, repo.description, repo.language, ...repo.topics]
      .join(' ').toLowerCase().includes(q);
  }

  function repoCard(repo) {
    const color = LANG_COLORS[repo.language] || 'var(--ink-3)';
    const tags = [];
    if (repo.homepage) tags.push('<span class="repo-tag tag-home">在线演示</span>');
    if (repo.archived) tags.push('<span class="repo-tag tag-archived">已归档</span>');
    if (repo.fork) tags.push('<span class="repo-tag tag-fork">Fork</span>');
    repo.topics.slice(0, 3).forEach((t) => tags.push(`<span class="repo-tag tag-topic">${escapeHtml(t)}</span>`));

    const pushed = repo.pushedAt ? repo.pushedAt.slice(0, 10) : '';

    return `<article class="repo-card" style="--c:${color}">
      <div class="repo-top">
        <a class="repo-name" href="${repo.url}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a>
        ${repo.stars ? `<span class="repo-star"><svg aria-hidden="true"><use href="#i-star"/></svg>${repo.stars}</span>` : ''}
      </div>
      <p class="repo-desc">${escapeHtml(repo.description) || '<span style="opacity:.5">暂无描述</span>'}</p>
      <div class="repo-meta">
        ${repo.language ? `<span class="lang"><i class="dot"></i>${escapeHtml(repo.language)}</span>` : ''}
        ${pushed ? `<span class="lang"><svg width="11" height="11" aria-hidden="true"><use href="#i-clock"/></svg>${pushed}</span>` : ''}
        ${tags.join('')}
      </div>
    </article>`;
  }

  function renderRepos() {
    const list = state.repos
      .filter(matches)
      .sort((a, b) => {
        if (state.sort === 'stars') return b.stars - a.stars || (a.pushedAt < b.pushedAt ? 1 : -1);
        return (a.pushedAt < b.pushedAt ? 1 : -1);
      });

    grid.innerHTML = list.map(repoCard).join('');
    emptyState.hidden = list.length > 0;
    if (countEl) {
      countEl.textContent = state.query || state.category !== 'all'
        ? `命中 ${list.length} 个`
        : `共 ${state.repos.length} 个公开仓库`;
    }
  }

  let searchTimer;
  searchEl?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => { state.query = v; renderRepos(); }, 120);
  });

  $('#repoSort')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderRepos();
  });

  /* ── 语言分布 ─────────────────────────────────────────── */
  function renderLanguages() {
    const counts = new Map();
    state.repos.forEach((r) => {
      if (!r.language || r.fork || r.archived) return;
      counts.set(r.language, (counts.get(r.language) || 0) + 1);
    });
    const rows = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => ({ name, n }));
    const total = rows.reduce((s, r) => s + r.n, 0) || 1;

    $('#langBar').innerHTML = rows
      .map((r) => `<i style="width:${(r.n / total) * 100}%;background:${LANG_COLORS[r.name] || 'var(--ink-3)'}" title="${escapeHtml(r.name)} ${r.n}"></i>`)
      .join('');

    $('#langList').innerHTML = rows
      .map((r) => `<li style="--c:${LANG_COLORS[r.name] || 'var(--ink-3)'}">
          <i class="dot"></i><span class="nm">${escapeHtml(r.name)}</span>
          <span class="bar"><span style="width:${(r.n / total) * 100}%"></span></span>
          <span class="ct">${r.n}</span>
        </li>`)
      .join('');
  }

  /* ── 团队 ─────────────────────────────────────────────── */
  function renderTeam(members) {
    const list = members && members.length ? members : [
      { login: 'zy84338719', url: 'https://github.com/zy84338719', avatarUrl: 'https://github.com/zy84338719.png' },
      { login: 'YifanChen117', url: 'https://github.com/YifanChen117', avatarUrl: 'https://github.com/YifanChen117.png' },
    ];
    $('#teamGrid').innerHTML = list
      .map((m) => `<a class="team-card" href="${m.url}" target="_blank" rel="noopener">
          <span class="team-avatar">
            <span class="team-initial">${escapeHtml(m.login.charAt(0).toUpperCase())}</span>
            <img class="team-photo" src="${m.avatarUrl}" alt="" loading="lazy" width="52" height="52">
          </span>
          <span class="team-meta">
            <span class="team-name">${escapeHtml(m.login)}</span>
            <span class="team-role">GitHub 组织成员</span>
          </span>
        </a>`)
      .join('');

    // 头像拉不到时退回首字母，不留破图
    $$('#teamGrid .team-photo').forEach((img) => {
      img.addEventListener('error', () => img.remove());
    });
  }

  /* ── 数字滚动 ─────────────────────────────────────────── */
  let statsReady = false;

  function countUp(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = Number(el.dataset.count) || 0;
    if (target === 0) { el.textContent = '0'; return; }
    const dur = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function startStats() {
    if (!statsReady) return;
    $$('#statStrip .num').forEach(countUp);
  }

  function observeStats() {
    const strip = $('#statStrip');
    if (!strip) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startStats();
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    io.observe(strip);
  }

  /* ── 滚动进场 ─────────────────────────────────────────── */
  function observeReveals() {
    const targets = $$('.section-head, .card, .agent-strip, .repo-toolbar, .lang-panel, .stack-panel, .team-card, .eco-card');
    if (!('IntersectionObserver' in window)) return;

    // 首屏内可见的一律不隐藏——内容绝不能因为动画而不可见
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(targets.indexOf(el) % 6, 5) * 55}ms`;
    });

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));

    // 兜底：滚动时把已经进入视口的隐藏元素放出来（IO 漏掉时也能显示）
    let ticking = false;
    const sweep = () => {
      ticking = false;
      $$('.reveal:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    }, { passive: true });

    window.addEventListener('beforeprint', () => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    });
  }

  /* ── 工具 ─────────────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ── 启动 ─────────────────────────────────────────────── */
  (async function init() {
    observeReveals();
    observeStats();

    let snapshot = null;
    try {
      snapshot = await (await fetch(SNAPSHOT)).json();
    } catch (_) { /* 快照不可用时用兜底成员列表 */ }

    try {
      const { repos, live } = await loadRepos();
      state.repos = repos;
      buildFilters();
      renderRepos();
      renderLanguages();
      if (snapshot?.members) renderTeam(snapshot.members);

      const src = state.repos.filter((r) => !r.fork && !r.archived);
      const langCount = new Set(src.map((r) => r.language).filter(Boolean)).size;
      setStat(0, state.repos.length);
      setStat(1, state.repos.reduce((s, r) => s + r.stars, 0));
      setStat(2, langCount);
      setStat(3, snapshot?.stats?.members ?? 0);
      statsReady = true;
      startStats();

      document.documentElement.dataset.dataSource = live ? 'live' : 'snapshot';
    } catch (err) {
      console.warn('[yi-nology] 仓库数据加载失败：', err);
      grid.innerHTML = '<p class="empty-state">仓库数据暂时加载不出来，稍后再试。</p>';
    }
  })();

  function setStat(index, value) {
    const nums = $$('#statStrip .num');
    if (!nums[index]) return;
    nums[index].dataset.count = String(value);
    nums[index].textContent = '0';
  }
})();
