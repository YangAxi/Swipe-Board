# Swipe Board

当前已实现 **T001–T011 / US1**：英文、移动端优先、单浏览器本地 demo。

GitHub 上传与手机分享：已准备 [部署指南](DEPLOYMENT.md)、[体验说明](SHARE.md) 和 `.github/workflows/deploy-pages.yml`。当前仅准备文件，未由本次操作上传或公开部署；成功部署后的预期网址为 https://yangaxi.github.io/Swipe-Board/ 。

## 启动

环境实测 Node **22.2.0**、npm **10.7.0**。React 19.2.0、TypeScript 5.9.3、Vite 6.4.6，依赖由 package-lock.json 固定。Vite engines 支持当前 Node，也可使用 Node 24 LTS。

```sh
npm ci
npm run dev
```

打开终端打印的本地地址，默认 http://127.0.0.1:5173。生产版本：

```sh
npm run check
npm test
npm run build
npm run preview
```

已附 `dist/`，需通过 HTTP 静态服务器访问，不使用 file:// 双击打开。

## 演示方式

1. My Account → Alex 或 Jordan：模拟校园账户，可发布出单和收单。
2. Post → 发布明天、De Neve、17:00–20:00、$8/swipe、数量 2 的出单。
3. 切换 Guest → Browse：按餐厅、最高价格、重叠时段和方式筛选，打开详情，刷新仍保留。
4. 切回本人，在 My posts 编辑、暂停、重开、关闭。暂停／关闭后不在公开列表，详情仍保留。
5. Sam 是普通模拟账户：出单提交被拒绝，收单可成功发布。Guest 只能浏览。

所有账户均为虚构；角色切换不发送邮件，不构成真实校园验证。公开卡片和资料不显示邮箱。Reset Demo Data 需主动确认，会替换本浏览器演示数据。

## 已实现

- Sell Swipes / Buy Swipes；默认洛杉矶今天与明天，可选全部未来或指定日期。
- 日期、重叠时段、餐厅、用餐方式、交接方式、价格／预算组合筛选；最新、最低单价、最高预算排序。
- 完整发布和详情；正整数数量、整数美分、预算有序、同日有效时段、备注长度校验。
- 本人资料和帖子管理，所有者权限；有预留时限制实质条件修改；关闭不更改已有计数。
- schemaVersion 1 localStorage，仅首次生成 10 条相对日期示例（含暂停、过期）与 3 个账户。加载损坏数据不覆盖，写入失败保留输入。
- v0 → v1 明确迁移：v0 使用相同用户／帖子字段，可缺少 transactions，迁移补空数组。未知版本和其他结构提示错误，不猜测迁移。

联系入口会检查游客、自我联系、不可用帖子和普通账户卖方权限；通过后说明消息／交易为下一阶段，**不会发送消息或预留库存**。

## 验证

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E 测试生产构建，先运行 build。默认使用 Playwright Chromium，也可指定本机 Chrome：

```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:e2e
```

测试桌面 1440×1000 与手机 390×844。实际结果见 [PROGRESS.md](PROGRESS.md)，截图见 [桌面](evidence/desktop-browse.png) 与 [手机](evidence/mobile-browse.png)。

本次 Codex Windows 沙箱限制祖先目录 lstat，直接构建曾失败；临时映射项目至空闲盘符后成功。普通本机终端通常不需要。不要覆盖已有盘符；环境专用复现：

```powershell
# 先确认 S: 未使用，再从项目目录在同一终端执行。
$projectPath=(Get-Location).Path
subst S: $projectPath
try {
  Set-Location S:\
  npm run check
  npm test
  npm run build
  $env:PLAYWRIGHT_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
  npm run test:e2e
} finally {
  Set-Location $projectPath
  subst S: /D
}
```

在本次沙箱中运行 dev 还需先设置 `$env:SWIPE_DEMO_NO_WATCH='1'`，关闭受限文件监听；修改源码后手动刷新。正常终端不设置此变量，保留热更新。

本次沙箱浏览器的 TEMP/TMP 另设为工作区 work/browser-temp。测试启动的服务器退出清理在该环境可能等待较长；可先单独运行 `npm run preview -- --port 5173 --strictPort`，E2E 会复用服务器。

## 边界与下一步

T012–T021 保留待办：聊天、双方条款确认、预留、完成／取消／争议、评价举报和屏蔽未实现。已有交易模型和数量保护不代表完整交易流程可用。

无真实认证、邮件、支付、后端数据库、跨设备通信或多人并发保证；前端权限仅用于本地演示。未进行真人 30 秒查找／60 秒发布测试、真实手机和多浏览器验收。

原始基准记录 UCLA 校规禁止出售或交换餐次；项目没有学校背书或许可。本次沿用基准，未重新调查校规或公开部署。

后续先读 AGENTS.md 和 PROGRESS.md，由 .specify/feature.json 定位当前规格，不另建竞争版本。

