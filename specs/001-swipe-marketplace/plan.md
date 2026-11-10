# Implementation Plan: Swipe Board MVP

**Branch**: none | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

## Summary

实现供需信息板，先完成发布到筛选的独立流程，再扩展聊天、预留和反馈。
本次已交付 T001–T011 第一阶段本地 MVP；US2、US3 和完整后续验收待办。

## Technical Context

- Language/Version — TypeScript，使用安装时生成的锁文件固定依赖。
- Primary Dependencies — React 19.2.0、Vite 6.4.6、TypeScript 5.9.3，锁文件固定。实际环境 Node v22.2.0、npm 10.7.0；已核对 engines 并修正启动记录的环境差异。
- Storage — 单一带 schemaVersion 的 localStorage 状态，状态变更集中处理。
- Testing — 类型检查、构建、状态转换回归检查、实际浏览器交互。
- Target Platform — 手机及桌面浏览器，英文界面。
- Project Type — 单前端演示，真实认证与多人服务后续实现。
- Performance Goals — 默认示例数据下筛选反馈即时，发布与筛选耗时由用户测试验证。
- Constraints — 两天演示目标、模拟身份、模拟交易、洛杉矶时区、USD 整数美分。
- Scale/Scope — 8 条以上种子帖子、3 个演示角色、供需/发布/详情/消息/账户/反馈。

## Constitution Check

研究前与设计后均通过以下检查。
供需定位保留；公开资料排除邮箱；确认与数量规则完整；演示边界可见；无外部发布。
设计未引入例外。通过表示文档一致，不能代替实现验收。

## Project Structure

当前规格位于 specs/001-swipe-marketplace，唯一活跃指针为 .specify/feature.json。
计划创建 src/App.tsx、src/styles.css、src/domain.ts、src/store.ts、src/seed.ts、
src/components/ 和 src/pages/，按实际复杂度拆分，不创建空抽象。

## Phase 0 Research

参见 research.md。确定 Vite 本地演示，真实多人并发留给后端事务。

## Phase 1 Design

参见 data-model.md、contracts/ui.md、quickstart.md。
后续依 tasks.md 顺序实施，每一故事形成可验证的完整流程。


## GitHub Pages 文件准备

目标仓库 YangAxi/Swipe-Board；按后续用户要求，补充静态 demo 发布配置与说明。本次仅准备部署文件，尚未公开发布。Pages 构建使用 /Swipe-Board/ base 和 dist-pages，普通开发与构建继续使用 / 和 dist。静态托管只提供应用文件，用户状态仍为各浏览器 localStorage；不改变认证、价格、数量或交易规则。

工作流先检查再部署，桌面／手机子路径测试独立于原有 US1 验收。真实 GitHub Actions、仓库设置和公网手机访问待实际上传后验证；见 DEPLOYMENT.md 与 PROGRESS.md。
