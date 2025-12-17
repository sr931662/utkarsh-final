// components/LoadingSpinner.jsx

import styles from './LoadingSpinner.module.css'


const LoadingSpinner = () => (
  <div className={styles.spinner_container}>
    <div className={styles.loading_spinner}></div>
  </div>
);
export default LoadingSpinner;