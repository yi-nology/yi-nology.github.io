# yi-nology.github.io — 设计规范

组织官网 `https://yi-nology.github.io` 的视觉与信息设计基线。

## 1. 风格锚点

**参考坐标**：Raycast / Linear / Vercel 这类「开发者基础设施」产品官网的密度与克制，
而不是营销落地页。页面的角色是**产品目录 + 工程仪表盘**——读者多半是同行工程师，
来找某个仓库、某个工具、或者判断这个组织靠不靠谱。

**质感关键词**：深色画布、细线框、等宽字体、克制的一处高亮、真实数据。

沿用组织既有 banner 的视觉语言（深海军蓝 + 六边形节点簇 + 蓝青绿渐变），
把它从静态图扩展成可交互的界面。

## 2. 色彩

### 深色（默认）

| 角色 | 值 | 用途 |
|:--|:--|:--|
| `--bg` | `#080C14` | 页面底色 |
| `--bg-1` | `#0B1220` | 卡片 / 分区底 |
| `--bg-2` | `#101B2D` | 抬升层（hover、导航） |
| `--bg-3` | `#16243B` | 输入框 / 标签底 |
| `--line` | `#1E3A5F` | 分隔线、描边 |
| `--ink` | `#F8FAFC` | 主文字 |
| `--ink-2` | `#94A3B8` | 次文字 |
| `--ink-3` | `#64748B` | 弱文字、meta |
| `--blue` | `#3B82F6` | 渐变起点 |
| `--cyan` | `#22D3EE` | 渐变中段、主强调 |
| `--green` | `#34D399` | 渐变终点、成功态 |
| `--amber` | `#F59E0B` | 归档 / 警示 |
| `--violet` | `#A78BFA` | Agent 类目 |
| `--orange` | `#F05032` | Git 类目 |

**主渐变**：`--blue → --cyan → --green`，仅用于一条强调线、渐变文字、数字下划线。
每张分类卡只保留**一个**语义色，避免彩虹化。

### 浅色（`[data-theme="light"]`）

底色反转为 `#F7F9FC` / `#FFFFFF`，文字 `#0B1220` / `#475569` / `#94A3B8`，
描边 `#DCE5F0`，渐变保留但加深一档以保证对比度。

### 语言色

按 GitHub 官方 linguist 配色：`Go #00ADD8`、`Rust #DEA584`、
`TypeScript #3178C6`、`Vue #41B883`、`Python #3572A5`、`JavaScript #F1E05A`、
`Shell #89E051`、`HTML #E34C26`、`Makefile #427819`。

## 3. 字体

- **展示 / 正文**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`
- **等宽**：`ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`

| 角色 | 字号 | 字重 | 字距 |
|:--|:--|:--|:--|
| Hero H1 | `clamp(38px, 6vw, 62px)` | 700 | `-0.02em` |
| Hero 副标 | `clamp(16px, 2vw, 20px)` | 400 | 0 |
| Section 标题 | `clamp(26px, 3.4vw, 36px)` | 650 | `-0.01em` |
| 卡片标题 | `19px` | 600 | `-0.01em` |
| 正文 | `15.5px` | 400 | 0 |
| meta / 标签 | `12.5px` | 500 | `0.02em` |
| 等宽代码 | `13px` | 500 | 0 |

中英混排时中文用 600/700 字重提升视觉重量，避免中文在深色底上发虚。

## 4. 布局

- 容器：`max-width: 1180px`，左右 padding 24px（移动端 18px）
- 栅格：12 列，`gap: 24px`
- 间距节奏：`8 / 12 / 16 / 24 / 40 / 56 / 88`
- 分区垂直留白：`88px`（桌面）/ `56px`（移动）
- 卡片圆角：`14px`；小标签 `999px`；按钮 `10px`
- 描边统一 `1px solid var(--line)`，hover 时边框换成该卡语义色的 45% 透明度

## 5. 两个签名时刻

**A. Hero 的六边形星群**
Logo 的「六边形 + 三个卫星节点」被拆成一张全幅 SVG：中央六边形缓慢呼吸，
三条连线上的光点沿路径往复移动，背景叠 40px 网格与两处径向光晕。
纯 CSS 动画（`transform` / `opacity`），不占主线程。

**B. 仓库目录卡片**
卡片左侧一条 3px 语言色竖条（hover 时延伸到分类色），右上角等宽仓库名。
hover 时卡片上浮 2px、边框点亮、右上角出现 `↗`。
筛选是即时本地的，搜索框输入 120ms 内重排网格。

## 6. 页面结构

| 区块 | 类型 | 一句话 |
|:--|:--|:--|
| Nav | sticky | 毛玻璃底 + 锚点 + GitHub 按钮 + 主题切换 |
| Hero | 大标题 + 数据条 | 一句话定位 + 4 个真实数字（计数动画） |
| 产品矩阵 | 卡片网格 | 9 个旗舰产品，中英名 + 一句话 + 技术标签 |
| 仓库目录 | 可搜索筛选 | 52 个仓库，搜索 / 类目筛选 / 语言点 |
| 技术栈 | 条形 + 标签 | 语言分布真实占比 + 方向标签 |
| 成员 | 头像 | 两位公开成员 |
| 生态链接 | 链接矩阵 | 官网 / 简历 / 导航站 / Golang 书 |
| Footer | 收尾 | 版权 + 仓库地址 |

## 7. 数据来源

页面运行时向 `https://api.github.com/orgs/yi-nology/repos` 拉取实时数据；
失败或被限流时回落到仓库存档 `assets/data/org-data.json`（由
`site-tools/fetch_org_data.py` 生成）。两者字段一致，切换无感知。

## 8. 技术与交付

- 纯静态：`index.html` + `assets/css/style.css` + `assets/js/app.js`，**无构建步骤**
- GitHub Pages 直接从 `main` 分支根目录发布（`.nojekyll`）
- 字体全部用系统栈，不外链；图标全部内联 SVG，不外链
- 唯一的外部请求是 GitHub API（失败静默降级）
- 响应式断点：`1080px` / `760px` / `520px`
- 无障碍：语义标签、`aria-label`、焦点可见、对比度 ≥ 4.5:1、`prefers-reduced-motion` 降级
