import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from "./utils";
import generatePackageJosn from "rollup-plugin-generate-package-json";
import alias from "@rollup/plugin-alias";
const { name, module, peerDependencies } = getPackageJSON("react-dom");
//react-dom包的路径
const pkgPath = resolvePkgPath(name);
//react-dom产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
  //react-dom
  {
    input: `${pkgPath}/${module}`,
    output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: "index.js",
        format: "umd",
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: "client.js",
        format: "umd",
      },
    ],
    //不要打包共享层的数据，直接使用react中的共享层数据
    external: [...Object.keys(peerDependencies)],
    plugins: [
      ...getBaseRollupPlugins(),
      //webpack resolve alias
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`,
        },
      }),
      generatePackageJosn({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          //不希望直接把react下面的package.json拷过去，因为其中的dependencies是依赖shared,而我们不希望打包后的文件中存在shared
          name,
          description,
          version,
          peerDependencies: {
            react: version,
          },
          main: "index.js",
        }),
      }),
    ],
  },
];
