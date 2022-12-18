import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from "./utils";
import generatePackageJosn from "rollup-plugin-generate-package-json";
const { name, module } = getPackageJSON("react");
//react包的路径
const pkgPath = resolvePkgPath(name);
//react产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
  //react
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: "React",
      format: "umd",
    },
    plugins: [
      ...getBaseRollupPlugins(),
      generatePackageJosn({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          //不希望直接把react下面的package.json拷过去，因为其中的dependencies是依赖shared,而我们不希望打包后的文件中存在shared
          name,
          description,
          version,
          main: "index.js",
        }),
      }),
    ],
  },
  //jsx-runtime
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      //jsx-runtime
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: "jsx-runtime",
        format: "umd",
      },
      //jsx-dev-runtime
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: "jsx-dev-runtime",
        format: "umd",
      },
    ],
    plugins: [getBaseRollupPlugins()],
  },
];
