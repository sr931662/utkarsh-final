import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './ResearchInterests.module.css';
import { DiGoogleAnalytics } from "react-icons/di";
import { Si365Datascience } from "react-icons/si";
import { GiJourney } from "react-icons/gi";

const ResearchInterest = () => {
  const { darkMode } = useTheme();

  return (
    <section 
      id="interests" 
      className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
      style={{
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)'
      }}
    >
      <div className={styles.container}>
        <h2 
          className={styles.sectionTitle} 
          style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}
        >
          Analytical Focus Areas
        </h2>
        
        <div className={styles.grid}>
          {/* Focus Area 1 */}
          <div 
            className={styles.card} 
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#334155' : '#f3f4f6',
              boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className={styles.iconContainer}
              style={{ backgroundColor: darkMode ? 'hsla(213, 93.90%, 67.80%, 0.10)' : 'rgba(47, 220, 232, 0.1)' }}
            >
              <DiGoogleAnalytics 
                className={styles.riIcon}
                style={{ color: darkMode ? '#60a5fa' : '#2fdce8' }}
              />
            </div>
            <h3 
              className={styles.cardTitle}
              style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}
            >
              Product Analytics
            </h3>
            <p 
              className={styles.cardDescription}
              style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}
            >
              Leveraging user behavior data to optimize product features and enhance customer experiences. 
              Specializing in A/B testing, funnel analysis, and feature prioritization for digital platforms.
            </p>
          </div>
          
          {/* Focus Area 2 */}
          <div 
            className={styles.card} 
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#334155' : '#f3f4f6',
              boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className={styles.iconContainer}
              style={{ backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(47, 220, 232, 0.1)' }}
            >
              <Si365Datascience 
                className={styles.riIcon}
                style={{ color: darkMode ? '#60a5fa' : '#2fdce8' }}
              />
            </div>
            <h3 
              className={styles.cardTitle}
              style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}
            >
              Data-Driven Decision Making
            </h3>
            <p 
              className={styles.cardDescription}
              style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}
            >
              Developing predictive models and business intelligence solutions to transform raw data into 
              actionable insights that drive strategic decisions and operational efficiency.
            </p>
          </div>
          
          {/* Focus Area 3 */}
          <div 
            className={styles.card} 
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#334155' : '#f3f4f6',
              boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className={styles.iconContainer}
              style={{ backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(47, 220, 232, 0.1)' }}
            >
              <GiJourney 
                className={styles.riIcon}
                style={{ color: darkMode ? '#60a5fa' : '#2fdce8' }}
              />
            </div>
            <h3 
              className={styles.cardTitle}
              style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}
            >
              Customer Journey Analysis
            </h3>
            <p 
              className={styles.cardDescription}
              style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}
            >
              Mapping and analyzing end-to-end customer interactions to identify pain points, 
              optimize conversion paths, and improve overall user engagement across digital platforms.
            </p>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p 
            className={styles.summary}
            style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}
          >
            My approach combines technical analytics expertise with business acumen to deliver measurable impact. 
            I focus on translating complex data into clear strategic recommendations for product and business growth.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResearchInterest;