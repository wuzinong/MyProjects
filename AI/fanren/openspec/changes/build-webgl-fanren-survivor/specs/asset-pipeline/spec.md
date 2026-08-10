## ADDED Requirements

### Requirement: Asset inventory is traceable
系统 MUST 为每个原始图片与动画生成素材记录，至少包含原路径、内容哈希、媒体类型、尺寸、视觉类别、候选用途、来源、许可证、审核状态和目标逻辑 ID。

#### Scenario: Inventory existing assets
- **WHEN** 素材盘点任务扫描 `assets/`
- **THEN** 每个受支持文件恰好产生一条可追溯记录，重复内容通过哈希标记而不被静默覆盖

### Requirement: Runtime assets use semantic names
系统 SHALL 只通过稳定逻辑 ID 和语义化运行时路径引用已选素材，不得由游戏代码直接引用 `screen_*` 或 `code_*` 原始文件名。

#### Scenario: Promote an approved image
- **WHEN** 审核者将一个图片标为可用于玩家头像
- **THEN** 管线生成语义化目标名与 manifest 映射，同时保留原文件到目标文件的追踪关系

### Requirement: Licensing gates release assets
发布构建 MUST 排除授权状态不是 `approved` 的素材，并 MUST 在被运行时 manifest 引用的素材未获批准时失败。

#### Scenario: Reject unknown-license asset
- **WHEN** 发布 manifest 引用了来源或许可证未知的素材
- **THEN** 发布构建失败并报告对应逻辑 ID 和原始路径

### Requirement: Assets are optimized for browser delivery
管线 SHALL 对已批准图片执行透明边裁切、尺寸分级、压缩和图集规划，同时保存满足画质与显存预算的产物。

#### Scenario: Prepare an oversized source image
- **WHEN** 一个 1024×1024 原图只作为小型技能图标使用
- **THEN** 运行时产物包含适配目标显示尺寸的优化版本而非强制加载原尺寸纹理

### Requirement: Animation references are safely ported
系统 MUST 将获批 HTML 中需要复用的 GLSL 或 SVG 动效重写为受版本控制的运行时模块，不得通过 iframe、远程脚本或 Tailwind CDN 嵌入原 HTML。

#### Scenario: Port an approved shader
- **WHEN** 开发者选用一个现有 WebGL 动效
- **THEN** 动效以本地 effect module 和明确 uniform 接口运行，且不发起第三方网络请求
