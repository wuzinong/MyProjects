## ADDED Requirements

### Requirement: Game boots with capability checks
系统 SHALL 在进入游戏前检测 WebGL、关键浏览器能力和资源加载结果，并在能力不足或加载失败时显示可操作的中文错误信息。

#### Scenario: WebGL is unavailable
- **WHEN** 浏览器无法创建受支持的 WebGL 上下文
- **THEN** 系统不进入战斗并显示兼容性说明和重试入口

### Requirement: Input supports desktop and touch
系统 SHALL 支持 WASD/方向键移动以及移动端单手虚拟摇杆，且两类输入映射到相同的归一化移动意图。

#### Scenario: Touch player changes direction
- **WHEN** 玩家在摇杆有效区拖动触点
- **THEN** 角色按对应归一化方向移动，并在触点释放后停止输入

### Requirement: Scene flow is explicit
系统 MUST 通过明确状态管理启动、洞府、秘境加载、战斗、暂停、升级选择和结算，暂停类状态不得继续推进战斗时间。

#### Scenario: Open upgrade choices
- **WHEN** 玩家获得足够灵气并触发升级
- **THEN** 战斗模拟暂停，三选一界面显示，选择完成后从同一模拟时刻继续

### Requirement: HUD communicates combat state
战斗 HUD SHALL 显示生命、法力、神识、等级、经验、局内计时、毒雾阶段、当前技能与首领生命，并适配安全区和横竖屏。

#### Scenario: Boss enters the arena
- **WHEN** 墨蛟首领生成
- **THEN** HUD 显示首领名称和生命条且不遮挡移动控制核心区域

### Requirement: Settings persist
系统 SHALL 提供音量、静音、画质、屏幕震动和飘字密度设置，并在重载后恢复。

#### Scenario: Reduce visual effects
- **WHEN** 玩家选择低画质并关闭屏幕震动
- **THEN** 后续场景使用低档视觉预算且不触发屏幕震动，战斗数值保持不变

### Requirement: Renderer degrades without changing simulation
系统 SHALL 提供低、中、高画质档位并限制设备像素比；降级只能减少视觉成本，不得改变敌人、命中、伤害或掉落结果。

#### Scenario: Switch to low quality during a run
- **WHEN** 玩家在暂停界面把画质从高调为低
- **THEN** 粒子、滤镜或渲染分辨率降低，但相同种子与输入下的战斗模拟结果不变

### Requirement: WebGL context loss is handled
系统 MUST 在 WebGL 上下文丢失时暂停模拟并尝试恢复资源，无法恢复时提供安全返回洞府的错误流程。

#### Scenario: Context is restored
- **WHEN** 浏览器报告上下文丢失后又成功恢复
- **THEN** 系统重建 GPU 资源并从暂停点继续，不重复发放掉落或结算
