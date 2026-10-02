# 素Clash · sssclash.com.cn

Astro 静态网站，简体中文。实现采用用户通过的黑白主色、蓝色交互和自然彩色配图。设计与 Grok 原始响应保留在本地 `design/`，不推送到仓库。代码现由 Codex 编写。

## 本地运行

需要 Node.js 24 和 pnpm 11。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

开发地址由终端输出。构建和检查：

```sh
pnpm build
pnpm preview
```

`build` 依次执行 Astro 类型检查、静态构建和全站链接/SEO/图片检查，任一步失败即返回非零状态。检测报告在 `reports/audit.json`。

## 内容和页面

- `src/data/software.json`：客户端、内核、iOS 相关工具与历史项目。每项提供平台、入口、FAQ；没有可用官方发布入口的历史项目只提供迁移教程。
- `src/data/airports.json`：全部 19 个指定购买域名。`plans` 为结构化套餐字段，当前缺少可比的实际价格时为空，页面提供购买入口和选购方法。
- `src/data/articles.json`：安装、订阅、分流、TUN、平台排查、套餐选择和客户端对比文章。
- `src/lib/content.ts`：软件专属教程、相关内链、标签归档及路由。
- `public/images/`：实际生成并压缩的配图；各页自动生成独立 PNG 分享图。
- 七个主栏目独立页面，包含各类详情、FAQ、标签、搜索、RSS、robots、sitemap、404 和 llms.txt。

## GitHub Pages

1. 将项目推送到自己的 GitHub 仓库 `main` 分支。
2. 仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 设置自定义域名 `sssclash.com.cn`，按 GitHub 指引配置 DNS 与 HTTPS。
4. `pages.yml` 在 main 更新或手动触发时构建、检查并部署。

`public/CNAME` 已配置域名；没有项目子路径 `base`。本地默认 `SITE_INDEXABLE=false`；部署流程设为 `true`。搜索页和404始终 noindex。

仓库 Variables 可填：

- `PUBLIC_GA4_ID`：GA4 测量 ID；首次交互或6秒后加载。
- `PUBLIC_GOOGLE_VERIFICATION`：Google Search Console 验证值。
- `PUBLIC_BING_VERIFICATION`：Bing Webmaster Tools 验证值。

没有填写时不会插入虚假标签。验证与统计需要在对应账户确认，文件存在不代表已完成站长验证或有真实流量。

## 自动更新

`refresh.yml` 每天北京时间10:00和手动触发时运行。

1. 从 GitHub 公共 API 更新软件稳定版本；单个请求失败保留原数据。
2. 可选从文章队列生成一篇教程，严格检查 JSON、字段、长度与完整性，不执行模型返回的代码。
3. 构建与全站检查通过后提交有变化的数据，再显式触发部署。无变化不提交。

软件版本刷新无需另提供密钥。AI 自动文章需要：

- Secrets：`GROK_API_KEY`。
- Variables：`AI_AUTO_UPDATE=true`、`GROK_MODEL`、`GROK_API_BASE`（默认 `https://booltoken.com/v1`）。

队列在 `content/article-queue.json`。接口不可用或输出不完整时不写文章、不发布该次变化。不要将密钥写到源码、前端或日志。

当前自动化覆盖软件版本与可选教程生成，不抓取登录后的机场面板，也不自动制造套餐价格和测评。真实套餐可逐项填入 `plans`：`name`、`price`、`period`、`traffic`、`details`。

## 发布前还需完成的外部配置

GitHub 仓库、Pages 权限、自定义域名 DNS，以及真实 Google/Bing 验证值。机场套餐和网络实测需有实际资料后补充；本地检查不代表线上已部署或被搜索引擎收录。

## 设计素材

素材原图与设计记录在本地 `design/`。`scripts/prepare-assets.mjs` 仅用于本机按素材清单压缩配图和生成图标，不属于部署流程。提交后的 `public/` 资产可直接用于其他机器构建。
