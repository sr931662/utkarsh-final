import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* About */}
          <div className={styles.about}>
            <h3 className={styles.footerHeading}>Mr. Utkarsh Gupta</h3>
            <p className={styles.footerText}>
              Research Scholar in Computational Neuroscience at Stanford University, 
              focusing on neural mechanisms of perception, learning, and decision-making.
            </p>
            <p className={styles.copyright}>© 2025 Mr. Utkarsh Gupta. All rights reserved.</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><a href="#interests" className={styles.footerLink}>Research Interests</a></li>
              <li><a href="#publications" className={styles.footerLink}>Publications</a></li>
              <li><a href="#cv" className={styles.footerLink}>CV</a></li>
              <li><a href="#contact" className={styles.footerLink}>Contact</a></li>
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;