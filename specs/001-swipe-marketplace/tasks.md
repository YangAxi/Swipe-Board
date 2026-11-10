# Tasks: Swipe Board MVP

Input 为同目录 spec.md、plan.md、research.md、data-model.md 和 contracts/ui.md。
T001–T011 已实现并验收，证据见 PROGRESS.md；T012–T021 保留待办。勾选只表示对应阶段实际完成。

## Phase 1 Setup

- [x] T001 在 package.json、index.html、vite.config.ts、tsconfig.json 建立 React TypeScript Vite 工程，锁定依赖并提供 dev/check/build 命令。
- [x] T002 在 src/App.tsx、src/styles.css 建立英文导航、移动端布局及可见 Demo 标记。

## Phase 2 Foundation

- [x] T003 在 src/domain.ts 定义账户、帖子和交易模型，金额为非负整数美分，数量为正整数，昵称 1–40、专业 0–100、备注 0–500 字符。
- [x] T004 在 src/store.ts 建立 schemaVersion 持久化，首次初始化、读写错误提示、旧版迁移和主动重置。
- [x] T005 在 src/seed.ts 生成相对洛杉矶当天的至少 8 条示例及 3 个演示账户，包含暂停和过期帖子。
- [x] T006 在 src/domain.ts 实现校园精确域名权限和洛杉矶日期解析，普通账户不可当卖方，游客不可写入。

## Phase 3 US1 查看并发布供需

Goal 为信息板可独立演示。检查为发布未来帖子、筛选找到、刷新保留、暂停隐藏。

- [x] T007 [US1] 在 src/pages/Browse.tsx 实现双标签、日期/重叠时间/地点/方式/价格组合筛选及相关排序，默认今天和明天。
- [x] T008 [US1] 在 src/pages/Post.tsx 实现出收单表单、预算有序、时段同日未结束校验，备注最多 500 字符，保留失败输入。
- [x] T009 [US1] 在 src/pages/Detail.tsx 展示完整条件和联系入口，禁止自我联系及对过期帖发起新交易。
- [x] T010 [US1] 在 src/pages/Account.tsx 实现本人编辑、暂停、重开与关闭，有预留时限制实质修改。
- [x] T011 [US1] 按 quickstart.md 验证发布、筛选、刷新和权限拒绝，在 PROGRESS.md 记录结果。

## Phase 4 US2 联系与确认

Goal 为双方确认后准确预留。检查为聊天不占数量、确认才预留、两个提案争取最后一份。

- [ ] T012 [US2] 在 src/pages/Messages.tsx 和 src/store.ts 实现唯一对话、消息访问控制、快捷消息，消息 1–2000 字符。
- [ ] T013 [US2] 在 src/domain.ts 和 src/store.ts 实现版本化条款与双方确认，校验角色及源帖可用量，重复确认幂等。
- [ ] T014 [US2] 在 src/pages/Messages.tsx 展示数量、单价、总价、交接条款和每方确认状态。
- [ ] T015 [US2] 验证库存 1 的两提案及重复确认，在 PROGRESS.md 保留具体结果。

## Phase 5 US3 完成取消与反馈

Goal 为有依据的完成记录。检查为双方完成才计数、取消释放一次、评价每人每交易一次。

- [ ] T016 [US3] 在 src/domain.ts 和 src/store.ts 实现完成、取消申请、争议及提案过期，预留和争议不自动释放。
- [ ] T017 [US3] 在 src/pages/Account.tsx 和 src/pages/Messages.tsx 展示历史与完成记录，双方一致解决争议才终结。
- [ ] T018 [US3] 在 src/components/Feedback.tsx 和 src/store.ts 实现评价 0–500 字符、私密举报、屏蔽与重复提交限制。
- [ ] T019 [US3] 按 spec.md US3 验证生命周期和隐私访问，在 PROGRESS.md 记录结果。

## Phase 6 Polish

- [ ] T020 在 src/styles.css 和 src/components/ 补齐空态、错误、可见标签与键盘焦点，实测 390px 和桌面。
- [ ] T021 运行 package.json 的类型检查和构建，执行 quickstart.md 全流程，更新 README.md 与 PROGRESS.md 的已实现/模拟/未验证内容。

## Dependencies & Execution Order

T001 → T002–T006 → US1 → US2 → US3 → T020–T021。
首个里程碑为 T001–T011，先交付发布到浏览的完整流程。

## Parallel Opportunities

US1 稳定接口后 Browse 与 Post 页面可由不同人实施；US2 条款规则先定，再做 UI；
US3 完成规则先定，反馈 UI 可独立设计。当前默认顺序执行，避免同文件冲突。

## Implementation Strategy

第一天完成基础与 US1，第二天完成 US2、US3 和验收。时间不足时保留已验证 US1，
明确列出未完成任务。两天是计划目标，实际耗时受实现和验证结果影响。


## 追加：GitHub 上传与部署准备

用户指定 YangAxi/Swipe-Board，仅准备文件；不将准备完成视为已上线。

- [x] 新增 GitHub Pages Actions 工作流，构建、检查后发布 dist-pages。
- [x] 提供 /Swipe-Board/ 专用 build:pages / preview:pages，保留本地开发入口。
- [x] 两个视口验证子路径资源、发布、详情刷新和保留：test:pages 2/2；check、test 7/7、两种 build 通过。
- [x] 整理 DEPLOYMENT.md、SHARE.md、README 与排除规则，生成源码上传包。
- [ ] 后续实际上传、启用 GitHub Pages、运行线上工作流并从真实手机验收（不属于本次文件准备）。
