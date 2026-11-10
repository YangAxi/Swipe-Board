# 技术调研与选择

## 工作流来源

采用 Agentic Coding Handbook 的需求、调研、计划、任务、检查与进度分工。
已读取仓库提交 c35ca0e0fd02d4c0319382d4a5409e49820fd240 的 project-guide 及相关章节。
来源 https://github.com/bingjiezhu/agentic-coding-handbook

## Spec Kit 集成

通过官方源代码的一次性 uvx 环境初始化 Codex 项目集成，未全局安装。
版本 1.3.4.dev0，官方仓库提交 08252af8c5fb1c68135768fde2049d6578fa46c3。
已按实际安装技能执行 constitution、specify、plan、tasks 的所需步骤。
来源 https://github.com/github/spec-kit

## 技术取舍

Decision — React、TypeScript、Vite。
Rationale — 已接受基准指定本地交互 demo，React TS 模板和静态开发入口符合范围。
Alternatives — Next.js 支持服务端能力，但本阶段没有已配置后端，无需扩大范围。
来源 https://vite.dev/guide/ 和 https://nextjs.org/docs/app/getting-started/installation

Decision — 单一版本化 localStorage 存储。
Rationale — 同一浏览器刷新保留。写入失败要提示，不把失败操作显示为已保存。
Alternatives — 真实多人服务用服务端数据库事务。本地浏览器存储缺少跨窗口锁保证。
来源 https://html.spec.whatwg.org/multipage/webstorage.html

## 未验证与后续问题

尚未安装应用依赖、构建、运行 UI 或测试浏览器存储失败。
真实邮箱发送、数据基础设施和校规运营条件尚未接入或解决。
既有校规结论沿用原始项目基准，本次未重新进行校规调查。
GitHub 网页抓取失败后通过 git clone 成功读取原始来源。
