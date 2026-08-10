## ADDED Requirements

### Requirement: Player movement and automatic combat
系统 SHALL 允许玩家直接控制角色移动，并由装备的技能按各自索敌、冷却和资源规则自动释放。

#### Scenario: Auto-cast fire projectile
- **WHEN** 火弹术冷却完成、法力足够且范围内存在有效目标
- **THEN** 系统消耗配置的法力并向选定目标发射火弹

### Requirement: Combat uses three resource dimensions
玩家与适用战斗单位 MUST 支持生命、法力和神识资源；法力用于法术或法宝能量，神识用于锁定及维持法宝/灵宠，生命归零触发死亡。

#### Scenario: Insufficient spiritual sense
- **WHEN** 新灵宠会使神识占用超过玩家上限
- **THEN** 系统阻止该灵宠出战并明确显示所需与可用神识

### Requirement: Damage pipeline supports channels and elements
系统 MUST 通过统一管线结算肉身、法力和神识伤害，并按配置应用防御、五行克制、暴击、标签和状态修正。

#### Scenario: Water attacks fire-aligned target
- **WHEN** 水属性攻击命中火属性且未声明免疫的目标
- **THEN** 最终伤害包含水克火的配置系数并记录可调试的伤害分解

### Requirement: Blood Trial follows a ten-minute timeline
血色禁地 SHALL 按 0–2、2–5、5–8、8–9:50 和 9:50–10:00 分段生成对应敌群、精英、毒雾和首领事件。

#### Scenario: Reach boss phase
- **WHEN** 局内计时达到 9 分 50 秒且玩家仍存活
- **THEN** 系统停止普通阶段推进、生成墨蛟并开始首领阶段

### Requirement: Poison fog constricts the safe area
系统 SHALL 在配置时点缩小安全区域，并对安全区外玩家持续施加可视、可配置且不会被普通闪避忽略的毒雾伤害。

#### Scenario: Player remains outside safe area
- **WHEN** 玩家在毒雾伤害周期到达时位于安全区外
- **THEN** 系统结算毒雾伤害并显示边界与受击反馈

### Requirement: Enemies and elites expose readable attacks
普通敌人、血玉蜘蛛精英和墨蛟 MUST 使用配置化行为；高威胁攻击必须在生效前提供与危险区域一致的预警。

#### Scenario: Ink Flood dragon uses tail sweep
- **WHEN** 墨蛟准备施放甩尾破甲
- **THEN** 系统先显示攻击范围和倒计时，再只对生效时位于范围内的玩家造成伤害与破甲

### Requirement: Loot and talismans are collectible
敌人 SHALL 掉落灵气和配置资源，精英遗迹宝盒 SHALL 提供一次性符宝；拾取与符宝效果不得重复结算。

#### Scenario: Collect Golden Brick talisman
- **WHEN** 玩家拾取含金光砖符宝的遗迹宝盒
- **THEN** 符宝进入可用槽位并在触发后仅消耗一次、造成配置的范围震波

### Requirement: Run completion is deterministic and persistent
系统 SHALL 在玩家死亡或击败墨蛟时冻结战斗、生成只结算一次的结果，并把允许带出的资源写入存档。

#### Scenario: Defeat the boss
- **WHEN** 墨蛟生命首次降至零
- **THEN** 系统停止战斗计时、显示胜利结算并原子化保存本局奖励

### Requirement: Combat meets density budgets
战斗实现 MUST 使用对象复用和空间查询，且压力场景 SHALL 支持至少 500 个活跃敌人和 1,500 个视觉实体而不改变游戏逻辑。

#### Scenario: Run the desktop stress fixture
- **WHEN** 基准设备以 1080p 中画质运行标准压力场景
- **THEN** 采样窗口的平均帧率达到 60 FPS 目标且无持续性逐帧内存增长
