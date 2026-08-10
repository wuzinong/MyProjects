## ADDED Requirements

### Requirement: Heaven vial accumulates capped green liquid
掌天瓶 SHALL 每经过一小时生成一滴绿液，容量上限为 12 滴；单次离线结算时间不得超过 12 小时。

#### Scenario: Return after fourteen hours
- **WHEN** 玩家在掌天瓶未满时离线 14 小时后返回
- **THEN** 系统最多按 12 小时结算且绿液总量不超过 12 滴

### Requirement: Clock rollback grants no offline reward
系统 MUST 检测最后可信时间之后的本机时钟倒退，异常期间不得生成离线绿液并须向玩家说明。

#### Scenario: Device clock moves backwards
- **WHEN** 当前时间早于存档中的最后可信时间
- **THEN** 系统发放零离线绿液、保留现有资源并显示时间异常提示

### Requirement: Herbs can be matured with green liquid
玩家 SHALL 能在药园选择已解锁灵草并消耗明确数量的绿液完成催熟，资源扣除和成品入库必须原子化。

#### Scenario: Mature an herb
- **WHEN** 玩家拥有足够绿液并确认催熟九曲灵参
- **THEN** 系统一次性扣除配置数量的绿液并把成熟灵材加入库存

### Requirement: Pills consume recipes and produce explicit outcomes
炼丹 SHALL 按配方检查并消耗灵材，产生成功丹药或配置的废丹结果；首版可使用直接炼制流程，不要求控火小游戏。

#### Scenario: Refine a Foundation Establishment pill
- **WHEN** 玩家拥有筑基丹配方所需材料并确认炼制
- **THEN** 系统只结算一次材料消耗并记录本次炼制结果

### Requirement: Realm breakthrough unlocks permanent progress
系统 SHALL 支持炼气、筑基、结丹、元婴和化神境界顺序，并在满足丹药与前置条件时突破；每个大境界按配置提高局内初始属性、初始神通槽或秘境解锁。

#### Scenario: Break through to Foundation Establishment
- **WHEN** 炼气玩家满足筑基条件并确认消耗筑基丹
- **THEN** 境界变为筑基、对应永久加成与解锁立即生效并被保存

### Requirement: Save data is versioned and recoverable
系统 MUST 校验并版本化保存境界、资源、洞府状态、解锁和设置，写入不得留下部分更新；已知旧版本必须迁移，未知较新版本不得被覆盖。

#### Scenario: Load a known older save
- **WHEN** 系统读取到受支持的旧 schema version
- **THEN** 系统按顺序迁移、校验并保存为当前版本，同时保留玩家已获进度

#### Scenario: Load an unknown newer save
- **WHEN** 系统读取到高于当前客户端支持范围的 schema version
- **THEN** 系统停止写入该存档并提示使用更新版本客户端

### Requirement: Run rewards connect to cave progression
系统 SHALL 只把结算规则允许的秘境资源带回洞府，并保证同一局结果不能因刷新或重复操作再次领取。

#### Scenario: Reload after claiming rewards
- **WHEN** 玩家已领取某局奖励后刷新页面
- **THEN** 洞府库存保持已结算结果且不再次增加同一局奖励
