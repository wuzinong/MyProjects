// import React, { FC } from "react";
// import styles from "./PropertyList.scss";
// import { attributesFromBaseProps, BaseProps } from '../../common/BaseProps';
// import cn from 'classnames';

// export interface PropertyListProps extends BaseProps {

//   /** If true, render in vertical layout fit for smaller spaces. */
//   breakIf: boolean;
  
// }

// export interface PropertyProps extends BaseProps {
//   label: React.ReactNode;
//   content: React.ReactNode;
//   hasBorder?:boolean;
// }

// /** Renders a list of properties and values in a horizontal layout. */
// export const PropertyList: FC<PropertyListProps> = props => {
//   let Tag = props.tag || 'ul';
//   let attr = attributesFromBaseProps(props);

//   attr.className = styles.propertyList + ' ' + (props.breakIf && styles.break)

//   return <Tag {...attr}>
//     {props.children}
//   </Tag>
// }

// export const Property: FC<PropertyProps> = props => {
//   let Tag = props.tag || 'li';
//   let attr = attributesFromBaseProps(props);

//   attr.className =  cn(styles.property,props.hasBorder?"":styles.noBorder);

//   return <Tag {...attr}>
//     <div className={styles.label}>{props.label}</div>
//     <div className={styles.content}>{props.content}</div>
//   </Tag>
// }