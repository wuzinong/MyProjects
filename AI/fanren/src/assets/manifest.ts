/** 运行时素材 manifest 类型与访问器：只允许逻辑 ID 访问。 */
import manifestJson from './manifest.json';

export interface AssetEntry {
  path: string;
  category: string;
  cn: string;
  source: string;
  sha256: string;
}

export interface AssetManifest {
  version: number;
  assets: Record<string, AssetEntry>;
}

const manifest = manifestJson as AssetManifest;

/** 按逻辑 ID 取素材 URL；未知 ID 抛错以便尽早失败。 */
export function assetUrl(logicalId: string): string {
  const entry = manifest.assets[logicalId];
  if (!entry) throw new Error(`未知素材逻辑 ID: ${logicalId}`);
  return '/' + entry.path;
}

export function hasAsset(logicalId: string): boolean {
  return logicalId in manifest.assets;
}

export function assetEntries(): ReadonlyArray<[string, AssetEntry]> {
  return Object.entries(manifest.assets);
}
