# 上传 GitHub 与手机访问

目标仓库：https://github.com/YangAxi/Swipe-Board

**状态：部署文件已准备；尚未由本次操作上传、启用 Pages 或发布。**
首次部署成功后的预期地址为 **https://yangaxi.github.io/Swipe-Board/**，以 Actions 的实际部署输出为准。

## 1. 上传文件

下载并解压 `swipe-board-github-ready.zip`。解压后的 `Swipe-Board` 文件夹包含可上传的项目文件。

打开目标仓库，选择 **Add file → Upload files**，将 `Swipe-Board` 文件夹**里面的文件和目录**拖入上传区域，然后提交到 `main` 分支。

- 仓库顶层必须能直接看到 `package.json`、`src/`、`.github/`。不要再嵌套一层 `Swipe-Board/` 或 `swipe-board/`。
- 不要只上传 ZIP：GitHub 不会自动解压 ZIP，也不会从中读取工作流。
- `.github/workflows/deploy-pages.yml` 必须上传。缺少它就不会自动构建部署。
- 上传包已排除 node_modules、dist、dist-pages、缓存、测试临时结果、.env、日志、ZIP 与本机 Git 元数据。依赖由 Actions 根据 package-lock.json 安装。
- 包内保留 `.specify/`、`.agents/` 和 specs，是后续开发资料；网站只发布 dist-pages 构建产物，不发布这些源文档。
- 如果仓库已存在文件，请先查看差异并保留需要的文件；本次没有读取成功远程内容，不要盲目替换未知变更，也不要 force push。

也可以用 GitHub Desktop 克隆该仓库，再把解压目录中的文件复制到克隆目录，检查 Changes，提交并 Push origin。不要把 node_modules 从原始开发目录复制过去。

## 2. 启用 GitHub Pages

进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。

进入 **Actions → Deploy demo to GitHub Pages → Run workflow**，选择 `main` 并运行。以后推送到 main 会自动重新构建和部署。

工作流会执行：

1. 使用 Node 24 和 npm ci 安装锁定依赖。
2. 类型检查与领域回归。
3. `npm run build:pages`，生成 dist-pages。
4. 安装 Chromium，在 1440px 桌面与 390px 手机视口测试项目子路径、样式、发布、详情刷新及持久化。
5. 上传构建产物，部署到 github-pages 环境。

只有 build 检查成功才进入 deploy。无需自己创建或粘贴令牌、邮箱密钥或支付密钥；工作流使用 GitHub 内置 GITHUB_TOKEN 与 Pages OIDC 权限。

当前工作流监听 `main`。如果仓库默认分支不是 main，请修改 deploy-pages.yml 的 push.branches，并在手动运行时选择相应分支。

GitHub Free 的 Pages 需要公开仓库；私有仓库是否可用取决于账户方案与组织设置。若 Settings 中没有 Pages，先检查仓库权限和方案。

## 3. 分享与验收

等 Actions 的 **build** 和 **deploy** 都成功后，在 Pages 设置页或部署记录中复制实际网址，再发给对方。当前预期地址不是“已上线”声明。

手机访问后请检查：

- 能看到英文首页和 Demo 标记，样式完整。
- My Account 选 Alex 或 Jordan 可发布；Sam 仅能发布 Buy Swipes。
- 发布后详情、刷新、暂停／重开／关闭正常。
- 竖屏没有横向溢出。

**公开网址只共享应用，不共享帖子数据库。每部手机首次获得自己的种子数据，发布和资料保存在各自浏览器。** 你在电脑发帖，对方手机不会看到；真正共享供需需要下一阶段接入后端。演示不包含真实认证、聊天、支付或交易确认，也不代表学校许可。

## 本地检查 Pages 版本

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd run build:pages
npm.cmd run preview:pages
```

打开 http://127.0.0.1:4174/Swipe-Board/ 。本地开发仍用 `npm.cmd run dev`，无需改变原有地址。

自动检查（另开终端，先安装 Playwright Chromium，或指定已有 Chrome）：

```powershell
npx.cmd playwright install chromium
npm.cmd run test:pages
```

Windows 也可用 `$env:PLAYWRIGHT_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'` 指定本机 Chrome。Codex 沙箱专用路径映射说明仍见 README。

## 常见故障

| 现象 | 排查 |
| --- | --- |
| 没有 Actions 工作流 | 确认 .github/workflows/deploy-pages.yml 在仓库根目录下，且 Actions 未被禁用 |
| configure-pages 提示找不到站点 | 先在 Settings → Pages 将 Source 设为 GitHub Actions，再重新运行 |
| build 失败 | 打开失败步骤日志；先核对根目录有 package.json 与 package-lock.json |
| 网页 404 | 等待部署成功，核对实际网址和仓库名的大小写，不使用 github.com 源码地址作为网站地址 |
| 页面白屏或 JS/CSS 404 | 本仓库必须用 build:pages 的 /Swipe-Board/ base，不能把普通 dist 构建代替 Pages 产物 |
| 仓库重命名或改用独立域名 | 同步修改 package.json 的 build:pages／preview:pages、playwright.pages.config.ts、子路径测试与本文地址；独立域名通常使用 / |
| 别人看不到我的帖子 | 当前是浏览器独立 localStorage demo；部署静态网站不会提供共享数据库 |

配置依据：[Vite 静态部署文档](https://vite.dev/guide/static-deploy.html#github-pages)、[GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。本机通过不等于 GitHub Actions 或公网已经运行成功。
