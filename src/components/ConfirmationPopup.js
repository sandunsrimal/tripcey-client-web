// components/ConfirmationModal.js

import React from 'react';
import styles from '@/styles/ConfirmationModal.module.css';

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
      <div className={styles.overlay}>
        <div className={styles.popup}>
          <p className={styles.message}>{message}</p>
          <div className={styles.buttonContainer}>
            <button className={styles.confirmButton} onClick={onConfirm}>Confirm</button>
            <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmationPopup;