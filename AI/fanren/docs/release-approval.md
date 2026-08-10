# 发布审批清单（IP / 素材 / 依赖）

## 状态总览

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 视觉素材（272 图） | ✅ 项目内生成 | 全部素材为项目所有者提供的 AI 生成图，标记 `project-generated / project-internal`，经 `asset-inventory.json` 审核字段管理 |
| 动效参考（29 HTML） | 🔒 隔离 | 标记 `quarantined`，仅作 GLSL/SVG 移植参考，禁止直接进入构建（含 Tailwind CDN 引用） |
| 字体 | ✅ 系统字体 | 仅使用 system-ui / Microsoft YaHei 系统字体栈，无内嵌字体文件 |
| 音频 | ⬜ 暂无 | 首版无音频资源；接入前须核验许可证 |
| 运行时第三方依赖 | ✅ 已核验 | pixi.js (MIT), zod (MIT)；构建产物无 CDN/远程脚本 |
| “凡人修仙传”IP | ⚠️ 待确认 | 角色/法宝/地名等文本引用原著设定。公开商业发布前必须取得 IP 授权或改写为原创设定 |

## 发布门禁（自动化）

- `npm run assets:validate`：manifest 引用素材必须 `approved`、语义命名、文件存在、源码禁引原始文件名 —— 构建前强制执行（`npm run build` 内联）。
- `npm run ci`：typecheck + lint + test + assets:validate + build。

## 已知注意事项

- 部分 AI 原图自带棋盘格底纹（生成时烙进像素），视觉上有白色格纹。需后续用去底工具重处理或重生成，清单中保留原图追踪。
- 公开发布前必须完成上表 ⚠️ 项。
