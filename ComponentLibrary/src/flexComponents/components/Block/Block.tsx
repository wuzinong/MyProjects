import React, {FC} from "react";
import { BaseProps } from "../../common/BaseProps";

interface BlockProps extends React.CSSProperties {
  /** The rendered HTML tag. Defaults to `div`. */
  tag?: keyof JSX.IntrinsicElements;

  className?: string;

  /** HTML attributes passed through to the rendered element. */
  attr?: Pick<BaseProps, 'attr'>;
}

/** 
 * Renders a plain element with some styles, ideal for ad-hoc spacing and positioning.
 * 
 * ### Example usage
 * 
 * Fine-tuning position with margins, padding, transform, dimensions, etc.
 * ```jsx
 *    <Block marginTop="16px" transform="translateX(2px)">
 *      <Button>Position me!</Button>
 *    </Block>
 * ```
 * 
 * Adding some spacing between two elements
 * ```jsx
 *    <Button>Cancel</Button>
 *    <Block width="32px"/>
 *    <Button>OK</Button>
 * ```
 * 
 * Layouting (here right-aligning children)
 * ```jsx
 *    <Block display="flex" flexDirection="row" justifyContent="flex-end">
 *      <Button>Cancel</Position>
 *      <Button>OK</Position>
 *    </Block>
 * ```
 * 
 */
export const Block: FC<BlockProps> = ({children, tag, attr, className, ...style}) => {
  let Tag: any = tag || 'div';

  return <Tag className={className} style={style} {...attr}>
    {children}
  </Tag>
}
