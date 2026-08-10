# 源码边界（Source Boundaries）

| 目录 | 职责 | 约束 |
| --- | --- | --- |
| `src/app/` | 应用流程：启动、能力检测、场景状态机 | 不包含战斗数值逻辑 |
| `src/sim/` | 确定性战斗模拟：实体、伤害、状态、波次、构筑 | 纯 TypeScript，禁止 import pixi.js / DOM API |
| `src/render/` | PixiJS 渲染、摄像机、粒子、画质档位 | 只读模拟状态，不得修改模拟 |
| `src/content/` | 配置数据与 Zod 模式（技能/敌人/波次/五行/境界） | 数据 + 校验，无副作用 |
| `src/persistence/` | 版本化存档、迁移、离线结算 | 通过注入的 storage 接口访问 localStorage |
| `src/ui/` | DOM UI：HUD 桥接、设置、洞府面板、升级选择 | 通过事件与 app 层通信 |
| `src/assets/` | 运行时素材 manifest 类型与加载器、effect modules | 只允许逻辑 ID，禁止 `screen_*`/`code_*` |
| `tools/assets/` | Node 素材管线：盘点、审阅页、晋升、校验 | 不打入运行时包 |
| `tests/` | Vitest 单元/集成测试与 fixtures | 与 src 目录镜像 |
| `public/assets/` | 已批准并语义化命名的运行时素材 | 仅由 promote 工具写入 |
| `assets/`（根） | 原始素材，保持不动 | 只读；游戏代码禁止直接引用 |
