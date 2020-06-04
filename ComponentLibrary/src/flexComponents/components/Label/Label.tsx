import * as React from 'react';
import { FC } from "react";
let styles = require('./Label.scss');
export interface LabelProps extends React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
  /** Removes all spacing around the component, facilitating custom layouting. */
  noSpacing?: boolean;
}

/** Renders a label describing a form input. The `htmlFor` attribute can be used to wire up the HTML of the form properly. */
export const Label: FC<LabelProps> = ({noSpacing, children, ...rest}) => {
  return <label className={styles.Label} data-nospacing={noSpacing} {...rest}>{children}</label>
}