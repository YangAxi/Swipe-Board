# Swipe Board — 项目目标与 Codex 开发指令
版本 v1.0 · 产品讨论基准

## 一、项目目标

为 UCLA 校园及周边有用餐需求的人提供清晰的 meal swipe 供需信息板。拥有闲置 swipes 的用户可以发布出售信息，需要 swipes 的用户可以浏览、筛选、联系卖家，也可以发布求购需求。平台减少散落在微信群和小红书中的重复询问，让价格、时间、地点、数量及交接方式在联系前就明确。

产品优先级依次为信息清晰、发布方便、交易状态准确、沟通可追踪。社交关系、兴趣匹配和自动推荐不属于核心需求。

“Swipe Board”是暂定工作名。界面默认英文，说明文档使用中文。第一阶段以两天内可运行、可点击演示的移动端优先 Web MVP 为目标。这些是实施默认值，可后续修改。

### 目标用户与权限

- 游客可以浏览公开有效帖子，联系和发布需要登录。
- 已验证校园邮箱用户可发布出单、收单，也可联系交易双方。
- 已验证其他邮箱用户可发布收单、联系卖家，也可回复自己收单的对话。
- 第一版校园邮箱精确允许 ucla.edu 和 g.ucla.edu，采用配置白名单。其他子域默认作为普通邮箱处理，后续确认再加入。
- 邮箱验证仅代表用户控制该邮箱，不代表当前学籍、meal plan 资格或行为安全。
- 昵称必填，年级和专业选填。邮箱保持私密。

### 校规边界

此前核对的 UCLA On-Campus Housing Regulations C.7(a) 禁止出售或交换餐次。此文档描述用户所需产品，不代表获得学校许可。改称补贴、约饭或使用平台外支付都不能据此宣称合规。

官方参考 https://reslife.ucla.edu/rules/on-campus-housing-regulations

原型默认使用模拟数据和模拟交易，不接入支付。真实服务启用前应重新核对规则及运营条件。不要把 Mobile Order 或 Pickup 的字段设计解释为学校许可，不收集 BruinCard、UCLA 登录密码或餐厅账户凭据。

## 二、可直接复制给 Codex 的完整开发指令

以下内容可作为首次开发任务输入。后续修改应继续以本文件为需求基准。

---

请实现一个暂名 Swipe Board 的响应式 Web MVP，面向 UCLA 校园及周边的 meal swipe 供需信息展示。请完成可运行的产品和必要验证，不仅提供计划。

### 1. 开工方式与范围

先检查当前目录、README、AGENTS.md、现有依赖和代码结构。已有项目沿用其技术栈和组件体系，以最小必要改动完成。空项目优先采用 React、TypeScript、Vite，样式沿用可用方案，不为简单界面引入庞大依赖。

第一阶段为两天演示 MVP。先交付完整 demo 模式，使用虚构数据、可切换演示账户和 localStorage 持久化。演示账户切换是本地身份模拟，不是校园邮箱认证。全局清晰标明 Demo，验证标签必须写明模拟，不生成虚假“已认证”声明。

localStorage 仅用于本地单浏览器演示，不支持真实多用户通信、身份验证或并发库存。代码结构允许后续替换数据访问层，但不要提前搭建无用架构。

若仓库已经具有后端和真实认证，复用现有实现并落实服务端权限。若没有后端或邮箱服务，明确记录接入需求，保持 demo 可运行。不要因为缺少密钥中断演示实现，也不要声称已完成真实认证。

不要自动部署、发送真实邮件或执行真实交易。开发期模拟交易不接入支付。界面不得宣称平台获得 UCLA 认可或解决了校规限制。

### 2. 核心产品逻辑

平台支持两类帖子。
- Sell Swipes，对外出售，填写单价和可提供数量。
- Buy Swipes，求购，填写数量和每次 swipe 的预算区间。

两个标签页直接展示供需，不做自动匹配、兴趣匹配或社交申请。用户查看帖子后直接发起聊天。兴趣标签、约饭话题、用餐时长均不必收集。

底部主导航建议为 Browse、Post、Messages、My Account。桌面使用合适的横向导航。发布后本人可编辑、暂停和关闭帖子。

### 3. 账户与访问控制

演示种子账户至少包含校园卖家、校园买家和普通邮箱买家。校园账户同时具备买卖权限。

游客只能浏览，不能读取私密聊天、发布或操作交易。普通邮箱账户不能创建出单，不能作为卖方确认交易。用户不能联系自己的帖子或与自己交易。

真实模式若接入，发布权限必须由服务端确认邮箱验证状态、域名与账户身份。用户不能通过修改前端角色字段获得权限。邮件域名应解析并精确比较，不能用简单包含 UCLA 的字符串判断。

注册拟定流程为邮箱输入、验证码、昵称。demo 用演示身份入口说明替代真实发送，并保留未接入说明。邮箱始终不出现在公开卡片、公开资料或公开数据响应里。

### 4. 页面与字段

A. Browse
- Sell Swipes 和 Buy Swipes 两个标签。
- 默认显示今天和明天的有效帖子，页面清楚显示当前日期范围，允许切换全部未来日期。
- 筛选日期、时间重叠区间、Dining Hall、用餐方式、价格或预算。
- 排序支持最新发布、最低单价，收单可支持最高预算。缺失或不适用的排序不显示。
- 卡片显示出/收、日期、可用时段、地点、单价或预算、剩余数量、方式、昵称和可核实的演示记录。
- 关闭、暂停、过期、无剩余数量的帖子不出现在默认公开列表。
- 空结果提供清除筛选和发布需求入口。

B. Post
- type、当地日期、开始时间、结束时间、Dining Hall、mealMethod、handoffMethod、quantity、priceCents 或 budgetMinCents/budgetMaxCents、备注。
- mealMethod 使用 Buffet Entry 与 Mobile Order。
- handoffMethod 单独使用 Meet at Entrance 与 In-person Pickup 等选项。Pickup 表示交接方式，不能和下单方式混作同一字段。
- 提供地点列表配置及 Other，自定义地点限制长度。
- 数量必须是正整数，金额用整数美分存储和校验。预算最小值不得大于最大值，时间结束必须晚于开始。
- 第一版每个帖子只支持同一天内的时段，不跨午夜。
- 校园时区统一 America/Los_Angeles，默认值、筛选和过期判断都使用该时区。
- 允许有效未来日期，禁止提交已结束时段。对备注和标题设合理长度限制。
- 发布时明确显示 Demo 和模拟交易提示。

C. Detail
- 展示所有条件、发布时间、发帖人简介、数量与状态。
- CTA 为 Contact Seller 或 Contact Buyer，不要求社交申请。
- 已关闭或过期详情仍可查看历史信息，但不接受新交易。
- 报告帖子和屏蔽用户有可用入口。

D. Messages
- 每段对话关联一个帖子和两个参与者，同一帖子同一对用户复用对话。
- 显示帖子摘要、消息时间和快捷消息。
- 买卖双方均可提出交易条款，条款包括数量、最终单价、用餐方式和见面安排。
- 第一个人确认产生提案，另一个人确认后才预留数量。任何条款修改使之前确认失效。
- 单纯开始聊天或发送消息不占用数量。

E. My Account / My Posts
- 本人资料、出单和收单、编辑、暂停、重新开放、关闭。
- 显示交易记录和完成状态。
- 有预留交易时限制修改日期、方式、地点和价格等实质条件。用户先解决相关交易，或另建帖子。
- 数量不能减到低于已预留与已完成数量之和。
- 关闭帖子禁止新交易，既有预留仍可完成或取消。

F. Feedback / Reports
- 仅真实完成的演示交易参与者可评价，每人每交易一次。
- 反馈包含是否符合约定、是否准时、简短文字。不要设计未经校验的星级假数据。
- 公开显示完成笔数和评价数量，私密举报与投诉不得公开。
- 双方确认完成后才计入公开完成笔数。
- 举报原因、可选补充文字、提交结果。demo 本地保存并说明未发送给运营人员。
- 屏蔽后阻止双方新建聊天和新交易，历史交易继续可查看和解决，保留举报入口。

### 5. 状态与数量一致性

Listing
- status 为 open、paused、closed，expiresAt 单独判断过期。
- totalQuantity、reservedQuantity、completedQuantity。
- availableQuantity = totalQuantity - reservedQuantity - completedQuantity。
- 仅 open、未过期且 availableQuantity > 0 可新增预留。

Transaction
- proposed、reserved、completed、cancelled、expired、disputed。
- proposed 不占数量，条款双方确认且库存足够后进入 reserved。
- 一方报告完成，另一方确认后转 completed。期间维持 reserved，并显示谁已确认。
- 一方在完成确认前申请取消，另一方同意后才释放库存。仅提案阶段可单方撤回。
- 一方报告未到场、未交付或存在争议，转 disputed。维持预留，等待双方一致解决。demo 可展示明确标注的模拟处理入口。
- 仅 proposed 在时间结束后自动 expired。reserved 和 disputed 不自动释放或自动计为完成，避免把已交付但尚未确认的数量再次卖出。
- completed 将预留数量转为完成数量，cancelled 将预留释放，每次只执行一次。
- 双方确认前再次检查可用数量，防止演示中两个提案共同占用同一剩余量。
- 重复点击确认、刷新、重复提交不能重复扣减或产生重复交易。
- 对收单同样记录需求总量、预留量和完成量。每笔交易只关联一个源帖子，明确 buyerId 与 sellerId，角色不能反转。
- 一个用户对同一帖子同一时间最多存在一个活跃交易，可在提案中调整数量。

这些规则在 demo 单一数据存储更新中实现。真实多人模式必须使用数据库事务、并发条件更新、幂等控制与服务端授权，不能依赖 localStorage 实现上述保证。

### 6. 最小数据模型

User
id、nickname、privateEmail、verificationState、campusEmailVerified、year、major、createdAt。

Listing
id、ownerId、type、dateLocal、startTimeLocal、endTimeLocal、expiresAt、diningHall、mealMethod、handoffMethod、totalQuantity、reservedQuantity、completedQuantity、priceCents 或预算区间、notes、status、createdAt、updatedAt。

Conversation
id、listingId、participantIds、createdAt。

Message
id、conversationId、senderId、body、createdAt。

Transaction
id、listingId、buyerId、sellerId、quantity、unitPriceCents、agreedTerms、termsVersion、confirmationIds、completionConfirmationIds、cancellationRequest、status、createdAt、updatedAt。

Review
id、transactionId、reviewerId、subjectId、structuredFeedback、comment、createdAt。

Report / Block
reporterId、targetId、targetType、reason、details、createdAt，以及 blockerId、blockedId。

私密账户字段与公开资料通过不同表示输出。不要在公开用户对象中顺带传递邮箱。

### 7. 视觉与交互

以移动端为优先，兼顾桌面。界面默认英文，按钮简短清楚，统一使用 swipe 数量和 USD 单价。

采用清晰卡片、足够留白、蓝色主色和少量金色强调。暂名 Swipe Board，不使用 UCLA 官方印章或暗示学校背书。

主要操作应在手机上容易点击，表单有可见标签、键盘支持、焦点状态和明确错误提示。补齐 loading、empty、error、success 状态。发布后能返回自己的帖子，确认交易后立即同步数量与状态。

种子数据至少 8 条，覆盖出单和收单、不同日期和地点、价格、暂停及过期情况。种子日期相对洛杉矶当天生成。数据只首次初始化，刷新不能覆盖用户操作。提供明确的 Reset Demo Data 操作。

### 8. 验收场景

1. 游客可筛选浏览，联系或发布时提示登录。
2. 校园演示账户可发布两类帖子，普通演示账户只能发布收单。
3. 出单筛选正确组合日期、时间、地点、方式和单价上限。
4. 价格按每次 swipe 展示，交易显示数量、单价和计算后的总额。
5. 发起聊天不改库存，双方确认才占用。库存 1 时两笔提案只能成功预留一笔。
6. 重复确认不重复扣减，取消经双方确认后恢复数量。
7. 单方完成不会增加公开完成数，双方确认后增加。
8. 刷新后保留帖子、消息和交易，首次种子不覆盖操作。
9. 过期帖子退出默认列表，详情保留。既有 reserved 不因过期被自动清除。
10. 用户不能编辑他人帖子、查看不属于自己的聊天或给自己的交易对手伪造评价。
11. 手机宽度约 390px 与桌面布局均可操作，无横向溢出。
12. 存在清晰 demo 标记，没有真实支付、真实认证或学校许可的误导性声明。

### 9. 实施和交付

建议第一天完成数据、权限、列表、筛选、发布与详情。第二天完成消息、交易确认、库存状态、反馈、移动端调整和验证。

优先保证浏览、发布、联系、双方确认、库存更新这条流程完整。完成后执行项目适用的类型检查和构建，验证权限与库存的关键回归场景，修复发现的问题。真实后端存在时，增加对应服务端测试。

交付可运行代码、简洁 README、启动命令、演示账户说明、已实现功能、模拟部分和后续接入清单。不要输出密钥或私密用户资料。

后续修改时读取本文件，保持供需信息板定位和已有交易数据一致。对新增字段提供旧数据兼容处理。若新需求改变角色权限、价格单位或交易状态，明确更新本基准与实现。

---

## 三、后续修改指令模板

请在现有 Swipe Board 项目上完成以下改动。

改动目标
[填写]

用户操作后的预期结果
[填写]

涉及页面
[填写]

验收例子
[填写一条具体操作和预期结果]

请先阅读项目基准、README 和当前实现，复用现有逻辑，以最小必要改动完成。对受影响的旧数据、权限、交易状态和库存保持一致性。完成后说明改了什么、如何验证，以及哪些功能仍是 demo。

