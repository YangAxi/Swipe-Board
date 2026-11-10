# Progress

日期：2026-11-09（America/Los_Angeles）。阶段：**第一阶段本地 MVP / T001–T011 完成**。

## 实际实现

- 从用户提供的启动 ZIP 解压到 outputs/swipe-board，保留 AGENTS.md、.specify 活跃指针和原有规格，不重建竞争规格。
- 读取 constitution、spec、plan、tasks、data-model、UI 合约、quickstart、research 和 input-baseline；将原始讨论中的广泛任务视为背景，按用户本次 T001–T011 范围执行。
- React + TypeScript + Vite 工程、固定依赖锁文件、dev/check/build/test/test:e2e/preview 命令。
- 英文导航、可见 Demo、供需双列表、组合筛选和类型相关排序；默认洛杉矶今天与明天，全部未来或指定日期可切换。
- 完整发布表单、详情、公开昵称资料；用餐与交接方式分开；价格整数美分；数量、预算、时段、备注等校验。
- Guest / Alex / Jordan / Sam 角色入口（其中三位演示用户）；精确 ucla.edu / g.ucla.edu 域名权限；游客禁止写入、普通账户禁止卖方发布；公开投影排除邮箱。
- 本人资料与帖子编辑、暂停、重开、关闭；他人不可编辑；有预留限制实质条件，数量不得低于预留与完成之和；关闭保留计数和详情。
- 单一 schemaVersion=1 localStorage，首次初始化 10 条相对洛杉矶日期示例，含暂停／过期；刷新不覆盖用户操作；读取损坏／未知版本不覆盖；写入成功后才更新状态；失败保留输入；主动确认重置。
- 支持的 v0 合约为相同字段、可缺少 transactions，迁移补空数组再保存为 v1。合成 v0 数据已回归；没有真实旧应用数据库可迁移验证。
- 联系入口执行游客、自我联系、帖子不可用及卖方资格检查，通过时明确提示下一阶段未接入，无消息发送或数量占用。

## 执行检查与证据

环境实测 **Node v22.2.0 / npm 10.7.0 / 本机 Chrome**。启动文档记载的 Node v24.22.1 不适用于本次机器，已修正 plan/README。

依赖安装核对 engines 后选择 Vite 6.4.6、plugin-react 4.7.0；React 19.2.0、TypeScript 5.9.3；package-lock.json 固定依赖。最终 npm install 审计报告 0 vulnerabilities（仅为当时依赖审计结果）。

| 检查 | 实际结果 |
| --- | --- |
| npm run dev | 临时盘符 + SWIPE_DEMO_NO_WATCH=1 启动成功；首页、main.tsx、App.tsx、CSS、React DOM 依赖 HTTP 200 |
| npm run check | 通过，退出码 0 |
| npm test | 7 组通过，0 失败；精确域名、隐私投影、LA/DST、字段、组合筛选、权限／数量保护、迁移／错误保存、联系边界 |
| npm run build | 通过，37 modules，dist 生成；JS 226.29 kB / gzip 70.09 kB，CSS 11.63 kB / gzip 3.26 kB |
| npm run test:e2e | **6 passed (35.1s)**，退出码 0；桌面 1440×1000 与手机 390×844 各 3 项 |
| 应用内浏览器实操 | 发布明日 $8×2、游客筛选、刷新保留、暂停隐藏、重开编辑、关闭详情、普通账户拒卖／可买、预算错误保留输入、空态恢复、越权编辑及游客联系提示、键盘 Enter 导航 |
| 布局与控制台 | 390px 与 1440px 无横向溢出；应用内浏览器错误日志为空，完整流程测试也监听 pageerror 并通过 |

自动浏览器用例：

1. 校园发布 → 游客按地点／单价／重叠时段／方式筛选 → 刷新 → 本人暂停／重开／编辑／关闭 → 普通账户拒绝出单、允许收单 → 空结果恢复。
2. 注入损坏存储，确认原始数据未覆盖；主动重置；注入 setItem 错误，显示 Not saved 且保留输入。
3. 反向时段拒绝、过期详情不可联系、直接路由越权编辑被拒绝。

最新截图：evidence/desktop-browse.png、evidence/mobile-browse.png；HTML 报告：evidence/playwright-report.html。测试源在 tests/，后续可重复运行。

### 环境问题与修复

- 初次 npm 网络请求被沙箱阻止，获本轮网络授权后下载成功。初次 Vite 7 engines 不兼容本机 Node 22.2，安装失败；最终切换为已核对兼容的 Vite 6.4.6。
- Windows 沙箱对子进程路径祖先 lstat 返回 EPERM；授予只读后仍存在。通过**同一终端临时 subst S: 映射项目本身**完成检查和运行，并启用 Vite preserveSymlinks，未修改原始 ZIP 或系统安装。
- tsx 在该沙箱 userInfo 报错，领域测试改用 esbuild 打包 + Node 内置 test，无需用户信息 API。
- 早期 E2E 的两个完整流程失败于测试选择器对嵌套 select 标签的精确匹配，改为 combobox 可访问名称；最终 6 项全部通过。
- 测试自行启动的预览服务器在沙箱退出清理阶段长时间等待；最终运行复用已有本地预览服务器，命令正常退出 0。README 保留普通启动与沙箱复现说明。
- 最后补充沙箱专用 SWIPE_DEMO_NO_WATCH=1 开关，避免 dev 文件监听因祖先路径 EPERM 重启失败。正常终端不设变量仍热更新；随后重新通过类型检查与构建，并验证 dev 的 5 个入口／模块 HTTP 200。该开关不影响已通过 E2E 的生产预览。

## 模拟内容与未实现

- 本地角色、邮箱状态、资料、示例帖子均为虚构；不是校园认证，不发送邮件，不接入学校系统或支付。
- localStorage 仅服务单浏览器角色模拟。跨窗口检测只提示重新加载，不提供原子并发锁；前端权限不构成真实服务安全边界。
- T012–T019 的消息、条款、双向确认、预留、完成、取消、争议、评价、举报、屏蔽尚未实现。现有模型和预留限制仅为基础与保护规则，不代表交易流程已完成。
- 真实认证、后端数据库事务、跨设备、多用户并发、邮件、支付、公开部署未接入或验证。
- 30 秒找到／60 秒发布的真人测试、真实手机、Safari/Firefox、屏幕阅读器和完整辅助功能审计未验证。
- 预留修改约束使用合成状态回归，尚无预留 UI 可交互验收；实际存储配额耗尽未制造，写入异常通过浏览器注入验证。
- 校规边界沿用基准，未重新调查；未宣称 UCLA 背书、许可或实际交易安全。

## 逻辑增量记录与下一步

1. T001–T006：工程、领域、权限、时区、种子与存储完成；7 组领域回归通过。
2. T007–T010：供需、表单、详情与本人管理完成；构建通过，浏览器主流程验证。
3. T011：桌面／手机 6 项自动验收和应用内实操完成，更新 tasks、README、quickstart、plan 与本记录。

下一可执行任务为 **T012**：唯一对话、消息访问控制和快捷消息。按当前规格扩展 US2 后再做条款预留；T020–T021 涉及完整后续流程，继续保留未完成，尽管本阶段已做基础布局与构建验收。

启动前的工作流初始化历史仍可在原始启动 ZIP 与 .specify 文档追溯。本记录以实际实现和执行结果为准。


## 运行修复（2026-11-09）
用户截图显示依赖安装未完成、vite 命令缺失；还存在把 dev 输入为 dex 的一次拼写错误。停止先前开发进程以释放 esbuild.exe，用工作区 npm 缓存离线恢复依赖成功，重新启动 dev；首页及 main.tsx HTTP 200。新增 start-demo.cmd，双击可启动，缺依赖时先安装；未在桌面双击该文件进行验收。


## GitHub 上传与部署文件准备（2026-11-09）

用户指定目标仓库 https://github.com/YangAxi/Swipe-Board，本次授权范围为整理上传与部署所需文件，不包含实际推送、改变仓库设置或公开发布。

- 新增 .github/workflows/deploy-pages.yml：main 推送或手动触发，Node 24，npm ci，类型与领域检查，Pages 构建、桌面／手机子路径检查，然后上传并部署产物。build 只有读取权限，deploy 才使用 Pages/OIDC 写入权限。
- package.json 新增 build:pages、preview:pages、test:pages。Pages 构建 base=/Swipe-Board/，产物独立在 dist-pages，不覆盖普通 dist；原有 dev/build 保持原路径。
- 新增 playwright.pages.config.ts 和 tests/pages/deployment.spec.ts；纳入 tsconfig 检查，验证真实项目子路径下 JS/CSS、发布、详情刷新、本地保留及无横向溢出。
- 新增 DEPLOYMENT.md（上传与设置步骤、故障排查）和 SHARE.md（手机体验说明），README 添加入口，.gitignore 排除 Pages 产物与临时报告等。
- 本次检查：npm run check 通过；npm test 7/7；npm run build 与 npm run build:pages 均通过；npm run test:pages **2 passed (13.0s)**，桌面 1440×1000 与手机 390×844；测试复用本机 4174 端口的独立 Pages 预览服务器，正常退出 0。
- Pages HTML 的资源引用确认含 /Swipe-Board/assets/。本机使用临时 S: 工作区映射与本机 Chrome，仍受此前 Windows 沙箱限制，不代表 Ubuntu CI 或公网已验收。
- 源码候选文件做常见令牌／私钥格式及用户机器目录扫描，无命中；不把此扫描描述为完整安全审计。
- 最终上传包为 outputs/swipe-board-github-ready.zip：保留源码、锁文件、工作流和文档，排除 node_modules、构建产物、临时文件、.env、Git 元数据和嵌套 ZIP。
- 远程 GitHub 页面／API读取未成功，git ls-remote 被当前网络环境阻断；未核对远程已有文件、默认分支、权限或 Pages 设置；未上传、未启用 Pages、未触发线上 Actions。
- 预期网址 https://yangaxi.github.io/Swipe-Board/ 仅为配置目标，不是已上线声明。仍为各浏览器独立数据 demo，未接入共享数据库或真实认证。

下一步：按 DEPLOYMENT.md 将上传包内容放到仓库根目录，在 Settings → Pages 选择 GitHub Actions，手动运行工作流，等成功后核对线上网址。T012 及后续交易功能继续待办。
