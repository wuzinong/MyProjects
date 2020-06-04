// import * as React from 'react';
// import { FC } from "react";
// import { attributesFromBaseProps, BaseProps } from '../../common/BaseProps';

// let styles = require('./Tag.scss');

// export interface TagProps extends BaseProps{
//     /** Defines the color scheme of the tag. */
//     variant?: 'green' | 'red' | 'yellow';
// }

// /** Renders a colored span of text. */
// export const Tag: FC<TagProps> = props => {
//     let Tag = props.tag || 'span';
//     let attr = attributesFromBaseProps(props);

//     attr.className = styles.Tag;
//     attr['data-variant'] = props.variant || 'green';

//     return <Tag {...attr}>
//         {props.children}
//     </Tag>
// }