import * as React from 'react';
let styles = require('./CheckboxInput.scss');

export interface CheckboxInputProps {
  id: string;
  isChecked?: boolean;
  onChange: (isChecked: boolean) => void;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({ id, children, isChecked, onChange }) => {
  return (
    <span className={styles.checkbox} >
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        tabIndex={0}
        onChange={() => { onChange(!isChecked) }}
      />
      <label htmlFor={id} >
        <span className={styles.checkboxSpan}>
          <div className={styles.checkmark} />
        </span>
        <span className={styles.checkboxLabel}>{children}</span>
      </label>
    </span>
  );
}
