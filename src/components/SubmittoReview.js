
import styles from '../styles/SubmittoReview.module.css';

const SubmittoReview = ({ onSubmit, onPrevious }) => {
  return (
    <div className={styles.submitToReviewContainer}>
      <div className={styles.iconWrapper}>
        <div className={styles.checkIcon}>
          {/* You can replace this with an actual SVG or icon component */}
          &#10003;
        </div>
      </div>
      <h2 className={styles.title}>Submit To Review</h2>
      <p className={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin felis a eget eget urna.
      </p>
      <div className={styles.buttonContainer}>
        <button type="button" onClick={onPrevious} className={`${styles.button} ${styles.cancelButton}`}>
          Previous
        </button>
        <button type="button" onClick={onSubmit} className={`${styles.button} ${styles.confirmButton}`}>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default SubmittoReview;
