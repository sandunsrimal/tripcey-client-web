import styles from './styles/ProgressBar.module.css';

const ProgressBar = ({ currentStep }) => {
  return (
    <div className={styles.progressBar}>
      <div className={`${styles.stepContainer} ${currentStep >= 1 ? styles.active : ''}`}>
        <div className={styles.circle}>{currentStep > 1 ? '✓' : '1'}</div>
        <div className={styles.label}>Place Details</div>
        <div className={`${styles.line} ${currentStep >= 2 ? styles.active : ''}`} />
      </div>
      <div className={`${styles.stepContainer} ${currentStep >= 2 ? styles.active : ''}`}>
        <div className={styles.circle}>2</div>
        <div className={styles.label}>Submit to Review</div>
      </div>
    </div>
  );
};

export default ProgressBar;