import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import {
  Type,
  Key,
  Ref,
  Props,
  ReactElementType,
  ElementType,
} from "shared/ReactTypes";

//ReactElment
const ReactElement = function (
  type: Type,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: "Bran",
  };
  return element;
};

export function isValidElement(object: any) {
  return (
    typeof object === "object" &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}

export const jsx = (type: ElementType, config: any, ...maybChildren: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;

  for (const prop in config) {
    const val = config[prop];
    if (prop === "key") {
      if (val !== undefined) {
        key = "" + val;
        continue;
      }
    }
    if (prop === "ref") {
      if (val !== undefined) {
        ref = val;
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }

  const maybeChildrenLength = maybChildren.length;
  if (maybeChildrenLength) {
    //children:两种情况，只有一个child ，或者有多个
    if (maybeChildrenLength === 1) {
      props.children = maybChildren[0];
    } else {
      props.children = maybChildren;
    }
  }
  return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;

  for (const prop in config) {
    const val = config[prop];
    if (prop === "key") {
      if (val !== undefined) {
        key = "" + val;
        continue;
      }
    }
    if (prop === "ref") {
      if (val !== undefined) {
        ref = val;
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }

  return ReactElement(type, key, ref, props);
};
