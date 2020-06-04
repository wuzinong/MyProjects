import React from 'react';

/** 
 * A small subset of CSS properties related to element positioning. These are supposed to be available directly as props
 * on many of the UI library components.
 */
export type BasePropStyles = Pick<React.CSSProperties,
  'margin' |
  'marginLeft' | 
  'marginRight' |
  'marginTop' |
  'marginBottom' |
  'transform'
>;

/**
 * The common set of props for most components in the UI library.
 * 
 * Tip: If some props do not make sense for a certain component, it can use `Omit` to remove
 * those.
 */
export interface BaseProps extends BasePropStyles {
  /** Overrides the base tag type for the rendered element. */
  tag?: keyof JSX.IntrinsicElements;

  /** Attributes that are passed through the rendered element. */
  attr?: Record<string, any>;
}

/**
 * From the props passed to a UI library component, derive a set of attributes to be passed to the rendered element.
 * 
 * @param props The base props from which to derive the attributes.
 * @param initialStyles Optional: Some initial style rules (will be overridden by values from the base props).
 */
export function attributesFromBaseProps(props: BaseProps, initialStyles?: React.CSSProperties): any {
  /** Pick out the styles from the base props. */
  function stylesFromBaseProps(props: BaseProps, initial?: React.CSSProperties): React.CSSProperties {
    let out: React.CSSProperties = {};
    if (initial) out = {...initial};
    [
      'margin',
      'marginLeft',
      'marginRight',
      'marginTop',
      'marginBottom',
      'transform'
    ]
      .filter(key => props[key])
      .forEach(key => out[key] = props[key]);

    return out;
  }

  let attr = props.attr ? {...props.attr} : {};
  let style = stylesFromBaseProps(props, initialStyles);
  return {
    ...attr,
    style: { ...attr.style, ...style }
  }
}