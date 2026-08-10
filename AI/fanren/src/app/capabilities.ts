/** 启动能力检测：WebGL、localStorage。失败返回中文可操作信息。 */
export interface CapabilityReport {
  ok: boolean;
  failures: string[];
}

export function checkCapabilities(doc: Document = document): CapabilityReport {
  const failures: string[] = [];
  try {
    const canvas = doc.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) {
      failures.push('当前浏览器无法创建 WebGL 上下文。请更新浏览器或启用硬件加速后重试。');
    }
  } catch {
    failures.push('检测 WebGL 支持时出错。请更新浏览器后重试。');
  }
  try {
    const key = '__fanren_probe__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
  } catch {
    failures.push('无法访问本地存储（localStorage），存档功能不可用。请退出无痕模式或放开站点数据权限。');
  }
  return { ok: failures.length === 0, failures };
}
