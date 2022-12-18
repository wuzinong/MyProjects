const { defaults } = require("jest-config");

module.exports = {
  ...defaults,
  rootDir: process.cwd(), //启动的根目录，即命令执行的根目录
  modulePathIgnorePatterns: ["<rootDir>/.history"],
  //配置引用的包去哪里解析
  moduleDirectories: [
    //对于React ReactDOM
    "dist/node_modules", //去dist下的node_modules下解析，即打包好的react以及reactdom
    //对于第三方依赖
    ...defaults.moduleDirectories,
  ],
  testEnvironment: "jsdom",
};
