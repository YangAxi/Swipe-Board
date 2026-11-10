# Data Model

完整字段参见 input-baseline.md 的最小数据模型，本文件明确存储约束。

- User — id、nickname、privateEmail、verificationState、campusEmailVerified、year、major。
  公开投影仅返回 id、昵称、选填资料和可核实统计。
- Listing — id、ownerId、type、dateLocal、start/endTimeLocal、expiresAt、diningHall、
  mealMethod、handoffMethod、totalQuantity、reservedQuantity、completedQuantity、
  priceCents 或预算区间、notes、status、createdAt、updatedAt。
- Conversation — id、listingId、participantIds、createdAt，同一帖同一双方唯一。
- Message — id、conversationId、senderId、body、createdAt。
- Transaction — id、listingId、buyerId、sellerId、quantity、unitPriceCents、agreedTerms、
  termsVersion、confirmationIds、completionConfirmationIds、cancellationRequest、status。
- Review — id、transactionId、reviewerId、subjectId、structuredFeedback、comment。
- Report / Block — 提交人、目标、原因、私密补充信息和时间；屏蔽双方 ID。

## Validation

数量为正整数。价格为非负整数美分，预算最小值不超过最大值。
昵称 1–40 字符，专业 0–100，备注 0–500，消息 1–2000，评价 0–500。
同一天开始早于结束，发布时结束时间必须在未来。日期以 America/Los_Angeles 解释。

## State transitions

帖子 open / paused / closed，过期由 expiresAt 判断。
可用数量 = 总量 - 预留量 - 完成量。
交易 proposed 不占库存，双方确认同一版本后 reserved。
reserved 双方确认完成后 completed，经双方同意取消后 cancelled。
proposed 可撤回或过期。reserved 可 disputed，保留数量直到双方解决。
completed 和 cancelled 为终态，重复操作无副作用。

关闭帖不影响既有预留，有预留时拒绝修改实质条件。
本地 demo 单操作流验证，真实并发保证由后端实现。
