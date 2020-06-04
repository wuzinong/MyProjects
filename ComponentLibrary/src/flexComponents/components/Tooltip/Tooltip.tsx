import * as React from 'react';
import {useState} from 'react';
import ReactTooltipLite from 'react-tooltip-lite';
import {TooltipProps as ReactTooltipLiteProps} from 'react-tooltip-lite';
import './Tooltip.scss';

export interface TooltipProps extends ReactTooltipLiteProps {}

/** 
 * Wrapper around `react-tooltip-lite`, making so it will show the tooltip upon focus, for keyboard navigation.
 * Also defaults `tagName` to `span`.
 * */
export const Tooltip: React.FC<TooltipProps> = ({tagName, children, ...rest}) => {
  let [forceShow, setForceShow] = useState(false);
  let TagName: any = tagName || 'span';

  return <TagName
    tabIndex={0}
    onFocus={()=>{ setForceShow(true) }}
    onBlur={()=>{ setForceShow(false) }}
    onMouseOver={()=>{ setForceShow(true) }}
    onMouseOut={()=>{ setForceShow(false) }}
  >
    <ReactTooltipLite tagName={TagName} isOpen={forceShow} {...rest}>
      {children}
    </ReactTooltipLite>
  </TagName>
}
