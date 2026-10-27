# yi-nology.github.io

组织官网 —— <https://yi-nology.github.io>

把复杂运维变简单。Developer tools for **Kubernetes**, **Git infrastructure** & **Agent-native ops**.

## 这是什么

一个零构建步骤的纯静态站点，直接由 GitHub Pages 从 `main` 分支根目录发布。

```
index.html              单页结构
assets/css/style.css    设计令牌与全部样式（深/浅双主题）
assets/js/app.js        数据加载、筛选、主题切换、滚动动效
assets/data/org-data.json  仓库数据快照（API 不可用时的回落）
assets/img/             品牌标识、favicon、OG 图
DESIGN.md               视觉与信息设计基线
```

## 数据来源

仓库目录默认实时请求 GitHub API：

```
https://api.github.com/orgs/yi-nology/repos?per_page=100&sort=pushed
```

匿名调用每小时 60 次配额；被限流或离线时自动回落到 `assets/data/org-data.json`，
两者字段一致，切换无感知。快照只包含**公开**仓库。

刷新快照（在仓库根目录执行，需要 `gh` 已登录）：

```bash
python3 ../site-tools/fetch_org_data.py assets/data/org-data.json
```

## 更新内容

- **产品矩阵**、**技术栈**、**团队**、**生态**：直接改 `index.html`
- **仓库目录**的分类规则：改 `assets/js/app.js` 里的 `CATEGORIES`
- **配色 / 字号 / 间距**：改 `assets/css/style.css` 顶部的 `:root` 令牌
- **OG 图**：`site-tools/og.html` 用 Playwright 截 1200×630 存到 `assets/img/og.png`

## 约定

- 字体全部走系统栈，图标全部内联 SVG —— 除 GitHub API 外无外部请求
- 动效在 `prefers-reduced-motion: reduce` 下自动降级
- 内容永远可见：滚动进场动画只作用于首屏之外的元素，且有兜底

## License

MIT
