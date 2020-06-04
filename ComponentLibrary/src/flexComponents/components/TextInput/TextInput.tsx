import * as React from 'react';
import {ChangeEvent} from 'react';
import { FC } from "react";
let styles = require('./TextInput.scss');


export interface TextInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  /** Removes all spacing around the component, facilitating custom layouting. */
  noSpacing?: boolean;

  state?: 'validated' | 'invalid';
}

export const TextInput: FC<TextInputProps> = ({noSpacing, state, ...rest}) => {
  return <input
    className={styles.TextInput}
    type="text"
    data-nospacing={noSpacing}
    data-state={state}
    autoComplete="no"
    {...rest}
  />
}