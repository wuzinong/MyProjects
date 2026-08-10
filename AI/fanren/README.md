# 凡人修仙：血色禁地

基于 WebGL（PixiJS）的 2D 割草类游戏，主题取材《凡人修仙传》。控制角色在 10 分钟的「血色禁地」秘境中生存：自动施法清怪、升级三选一构筑、躲避毒雾收缩，最终击败关卡领主墨蛟，并把资源带回洞府进行修仙成长。

![tech](https://img.shields.io/badge/stack-Vite%20%2B%20TypeScript%20%2B%20PixiJS-blue)

## 环境要求

- Node.js ≥ 20（开发环境使用 v24）
- npm ≥ 10
- 支持 WebGL 的现代浏览器（Chrome / Edge / Firefox / Safari）

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

打开浏览器访问 **http://localhost:5173** 即可进入游戏。

## 玩法操作

| 操作 | 桌面端 | 移动端 |
| --- | --- | --- |
| 移动 | WASD / 方向键 | 左下角虚拟摇杆 |
| 使用符宝 | 空格 | — |
| 暂停 / 恢复 | Esc 或「暂停」按钮 | 「暂停」按钮 |
| 升级三选一 | 数字键 1/2/3 或点击 | 点按 |

**游戏流程**：洞府（催熟灵草 → 炼丹 → 突破境界）→ 进入血色禁地 → 生存 10 分钟并击败墨蛟 → 奖励带回洞府。掌天瓶离线每小时凝聚 1 滴绿液（上限 12 滴）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 生产构建（含素材授权校验 + 类型检查），输出到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm test` | 运行全部 Vitest 测试（129 个） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run ci` | 完整门禁：类型 + lint + 测试 + 素材校验 + 构建 |

## 素材管线

原始素材在 `assets/`（只读，勿改），运行时素材经归类重命名后位于 `public/assets/<分类>/`，由逻辑 ID 引用（禁止直接引用 `screen_*` 原始文件名）。

```bash
npm run assets:inventory   # 扫描原始素材生成 asset-inventory.json
npm run assets:review      # 生成本地审阅页 asset-review.html
npm run assets:promote     # 把已批准素材晋升为语义化命名 + 生成 manifest
npm run assets:validate    # 校验运行时素材（构建时自动执行）
```

## 项目结构

```
src/
├── app/          # 应用流程：能力检测、状态机、输入
├── sim/          # 确定性战斗模拟（纯 TS，60Hz 固定步长）
├── render/       # PixiJS 渲染、画质档位
├── content/      # 游戏数据配置（Zod 校验）
├── persistence/  # 版本化存档、洞府成长
├── ui/           # DOM UI：HUD、洞府、三选一
└── assets/       # 运行时素材 manifest 与 effect modules
tools/assets/     # Node 素材管线脚本
tests/            # Vitest 测试
docs/             # 源码边界、性能基准、发布审批清单
openspec/         # OpenSpec 规格与变更记录
```

## 常见问题

- **页面提示无法创建 WebGL 上下文**：请更新浏览器或在浏览器设置中启用硬件加速。
- **存档在哪里**：浏览器 `localStorage`（键 `fanren-save`），无痕模式下不可用。
- **检测到设备时间倒退**：为防止刷离线收益，时钟回拨期间不发放绿液，属正常行为。

## 相关文档

- 产品需求：`prd.md`
- 发布前审批清单（IP / 素材授权）：`docs/release-approval.md`
- 性能基准：`docs/performance-baseline.md`
