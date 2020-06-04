import * as React from 'react';
import { FC } from "react";
let styles = require('./SelectInput.scss');
export interface SelectInputProps extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  /** Removes all spacing around the component, facilitating custom layouting. */
  noSpacing?: boolean;

  state?: 'validated' | 'invalid';
}

export const SelectInput: FC<SelectInputProps> = ({noSpacing, state, ...rest}) => {
  return <select
    className={styles.SelectInput}
    data-state={state}
    data-nospacing={noSpacing}
    {...rest}
  >
  </select>
}