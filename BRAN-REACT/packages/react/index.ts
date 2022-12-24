import { resolveDispatcher, Dispatcher } from "./src/currentDispatcher";
import currentDispatcher from "./src/currentDispatcher";
import { jsxDEV, jsx, isValidElement as isValidElementFn } from "./src/jsx";
//React

export const useState: Dispatcher["useState"] = (initialState) => {
  const dispatcher = resolveDispatcher() as Dispatcher;
  return dispatcher.useState(initialState);
};

//内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
};

export const version = "0.0.0";
//根据环境区分使用jsx或者是jsxDEV
export const createElement = jsx;
export const isValidElement = isValidElementFn;
