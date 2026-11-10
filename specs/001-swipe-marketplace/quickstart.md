# Quickstart 与验收

T001–T011 已实现。US1 供需、发布、筛选、详情、演示身份和本人管理可运行；US2／US3 未实现。

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
```

自动浏览器验收先构建，安装 Playwright Chromium 或通过 PLAYWRIGHT_EXECUTABLE_PATH 指定本机 Chrome，再执行 `npm run test:e2e`。详见根 README 的沙箱说明。

## 首个流程

1. My Account 选 Alex，发布明天 De Neve 出单，17:00–20:00、单价 8 美元、数量 2。
2. Guest 按地点、最高价格 8、重叠时间 18:00–19:00、Buffet Entry、Meet at Entrance 筛选找到并查看详情。
3. 刷新仍存在。切回 Alex，暂停后公开列表隐藏；重开恢复，编辑保存；关闭后详情保留且拒绝新联系。
4. Sam 发布出单被拒绝并保留输入；选择 Buy Swipes 可发布收单。预算倒置需纠正。
5. 游客发布需身份；游客联系、自我联系、过期／关闭联系、他人编辑有明确提示。
6. 390px 与桌面检查列表、空结果、清除筛选、可见标签和键盘焦点。

`tests/domain.test.ts` 覆盖精确域名、时区／DST、价格数量、权限、预留保护、组合筛选、种子、v0 迁移、损坏／未知数据不覆盖及读写失败。

`tests/browser/us1.spec.ts` 在两个视口执行完整 US1，并注入损坏存储和写入失败，验证主动重置和输入保留。测试注入不等于实际磁盘已写满。

## 后续

US2／US3 的联系、条款、预留、完成、取消和反馈需 T012–T019 完成后再验收。真实用户耗时、跨设备和并发未验证。PROGRESS.md 记录命令、结果、限制和下一步。
