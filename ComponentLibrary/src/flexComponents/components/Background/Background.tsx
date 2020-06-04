import * as React from 'react';
import { BaseProps, attributesFromBaseProps } from '../../common/BaseProps';

let styles = require('./Background.scss');

interface BackgroundProps extends BaseProps {

}

/** A non-white background, meant to be used as a backdrop for card sections and other containers */
export const Background: React.FC<BackgroundProps> = (props) => {
  let Tag: any = props.tag || 'div';
  let attr = attributesFromBaseProps(props);
  attr.className = styles.Background;

  return <Tag {...attr}>
    {props.children}
  </Tag>;
}