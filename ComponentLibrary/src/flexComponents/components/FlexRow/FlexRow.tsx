import React from 'react';
let styles = require('./FlexRow.scss');
export interface FlexRowProps {

  /** If true, display vertically. */
  breakIf: boolean;

  /** The tag for the HTML element (defaults to `div`). */
  tag?: string;

  id?: string;
}

/**
 * Simple Bootstrap-like grid layout, rendering its children in a horizontal `flex` row with gutters inbetween.
 * 
 * This component is meant to be simple and minimal. If you need something more powerful, considering rolling
 * your own flex layout.
 * 
 * Children set their widths in the row with a `flex` attribute.
 * 
 * Note that since `padding` is applied to the `FlexRow`'s direct children, these should be merely positional wrappers,
 * and not styled components with borders or backgrounds. So wrap the children in `div` or `Block` or such if necessary.
 * 
 * ```jsx
 *    <FlexRow breakIf={screenWidth < 900}>
 *      <div style={{flex: '2'}}><FancyComponent/></div>
 *      <div style={{flex: '1'}}><FancyComponent/></div>
 *    </FlexRow>
 * ```
 */
export const FlexRow: React.FC<FlexRowProps> = ({children, breakIf, tag, id}) => {
  let Tag: any = tag || 'div';

  let additional: any = {};
  if (id) additional.id = id;

  return <Tag 
    id={id}
    className={styles.FlexRow}
    style={{display: 'flex', flexWrap: 'wrap', flexDirection: breakIf ? 'column' : 'row' }}
    {...additional}
  >
    {children}
  </Tag>;
};