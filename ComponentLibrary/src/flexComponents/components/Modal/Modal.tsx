import React from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';

let styles = require('./Modal.scss');

export interface ModalProps {
  width?: string;
  pureChildren?:Boolean;
}

/** Renders its children inside a centered box in the middle of the screen. The width of the modal can be specified as a prop, while the height will grow
 *  to fit the size of the content within.
 * 
 *  Implements focus lock using the `react-focus-lock` library, so that can't tab-navigate out to the page behind the modal.
 */
export const Modal: React.FC<ModalProps> = ({children, width,pureChildren}) => {
  return createPortal(
    <FocusLock returnFocus>
      <div className={styles.background}>
        {
          pureChildren?<>{children}</>:<div style={{ maxWidth: width || '760px' }} className={styles.modal}>
          {children}
        </div>
        }
      </div>
    </FocusLock>,
    document.body
  );
}
