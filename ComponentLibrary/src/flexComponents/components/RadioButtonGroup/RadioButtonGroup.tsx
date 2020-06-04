import * as React from "react";
import { FC } from "react";

let styles = require('./RadioButtonGroup.scss');

export interface RadioButtonGroupProps {

  /** A unique id for the button group, sets the `name` attribute of the radio inputs.
   *  If not unique, radio button groups might interfere with each other. */
  groupName: string;

  options: RadioOption[];
  onChange: (val: string) => void;
  value: string;

  /** The size of the radio buttons. */
  size?: 'small' | 'large';

  /** Whether the radio buttons are arranged horizontally or vertically. */
  layout?: 'horizontal' | 'vertical';
}

interface RadioOption {
  /** The string value bound to this radio button. */
  id: string;

  /** Template for the label shown next to the radio button. */
  label: React.ReactNode;

  /** Whether this option is available to be selected. */
  disabled?: boolean;
}

/** Renders a group of radio buttons. */
export const RadioButtonGroup: FC<RadioButtonGroupProps> = ({ options, value, onChange, groupName, size, layout }) => {
  return <div className={styles.radioButtonGroup} data-layout={layout}>
    {options.map(option => <div key={option.id} className={styles.radioButton} data-checked={value==option.id} data-disabled={option.disabled}>
      <input
        type="radio"
        name={groupName}
        id={option.id}
        value={value}
        onChange={() => onChange(option.id)}
        checked={value==option.id}
        disabled={option.disabled}
      />
      <label htmlFor={option.id} data-size={size}>{option.label}</label>
    </div>)}
  </div>
}