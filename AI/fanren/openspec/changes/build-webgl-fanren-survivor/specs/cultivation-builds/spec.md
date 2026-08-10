## ADDED Requirements

### Requirement: Level-up offers three valid choices
系统 SHALL 在玩家升级时提供三个遵守解锁、互斥、满级和权重规则的不同选项，并在候选不足时使用明确的资源奖励替代。

#### Scenario: Generate seeded choices
- **WHEN** 相同存档状态、局内状态和随机种子触发同一次升级
- **THEN** 系统产生顺序一致的三个候选项

### Requirement: Choices cover cultivation build categories
首版候选池 MUST 包含神通、法宝、心法和灵宠，并至少实现火弹术、冰锥术、风刃术、地刺术、青竹蜂云剑、长春功、罗烟步、太一诀和噬金虫。

#### Scenario: Select a passive art
- **WHEN** 玩家选择罗烟步
- **THEN** 系统增加配置的移动与闪避修正，并在构筑摘要中显示当前等级

### Requirement: Skills upgrade through data-defined levels
每个可升级能力 SHALL 通过校验后的配置定义等级、数值、效果标签、资源消耗和上限，升级必须应用对应等级的完整效果。

#### Scenario: Upgrade an existing spell
- **WHEN** 玩家选择已经拥有且未满级的冰锥术
- **THEN** 系统把技能提升一级并按该级配置更新投射物或伤害效果

### Requirement: Azure Bamboo swords unlock milestones
青竹蜂云剑 SHALL 以局内剑意层数依次解锁飞剑、12 口护体雷域、36 口连锁雷电和 72 口大庚剑阵里程碑；对魔道或鬼物标签目标应用辟邪神雷加成。

#### Scenario: Reach the final sword milestone
- **WHEN** 青竹蜂云剑构筑达到 72 口等价里程碑
- **THEN** 系统解锁持续 8 秒、冷却 30 秒且使用配置倍率的大庚剑阵

### Requirement: Gold-devouring insects consume hostile effects
噬金虫 SHALL 自动附着有效精英或首领并持续攻击，且可按配置概率吞噬可吞噬护盾或弹幕并转化为法力。

#### Scenario: Consume a hostile projectile
- **WHEN** 噬金虫效果命中带 `consumable-projectile` 标签的敌方弹幕且概率判定成功
- **THEN** 弹幕在造成伤害前失效并为玩家恢复不超过上限的配置法力

### Requirement: Build data is validated
系统 MUST 在开发和构建阶段校验构筑配置的 ID 唯一性、引用、等级连续性、数值范围和 effect type，非法配置不得进入可发布构建。

#### Scenario: Reject unknown effect
- **WHEN** 技能配置引用未注册的 effect type
- **THEN** 配置校验失败并报告技能 ID 与错误字段
