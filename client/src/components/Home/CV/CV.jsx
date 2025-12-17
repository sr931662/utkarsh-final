import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './CV.module.css';
import CV_file from "../../../assets/Files/Current_Resume.docx"
import { authAPI } from '../../../context/authAPI';

const CV = () => {
  const { darkMode } = useTheme();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        // Fetch public superadmin data which contains the CV information
        const response = await authAPI.getPublicSuperadmin();
        if (response.success) {
          setCvData(response.data.user);
        } else {
          setError('Failed to fetch CV data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching CV data');
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading CV data...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <section id="cv" className={`${styles.section} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Professional Experience</h2>
        <p className={`${styles.sectionSubtitle} ${darkMode ? styles.dark : ''}`}>
          A summary of my professional journey, key achievements, and technical expertise.
        </p>
        
        <div className={styles.downloadContainer}>
          <a 
            href={CV_file} 
            className={styles.downloadButton} 
            download
            style={{ backgroundColor: darkMode ? '#60a5fa' : '#2fdce8' }}
          >
            <i className="ri-download-line mr-2"></i>
            <span>Download Full CV (PDF)</span>
          </a>
        </div>
        
        <div className={styles.grid}>
          {/* Professional Experience */}
          <div>
            <h3 className={styles.timelineTitle}>Work Experience</h3>
            
            <div className={styles.timeline}>
              {/* Dynamically render work experience from the database */}
              {cvData?.workExperience?.map((exp, index) => (
                <div className={styles.timelineItem} key={index}>
                  <div className={styles.timelineDot}></div>
                  <div 
                    className={styles.timelineCard}
                    style={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <p className={styles.timelineDate}>
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                      {exp.endDate ? 
                        ` - ${exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 
                        (exp.current ? ' - Present' : '')}
                    </p>
                    <h4 className={styles.timelineHeading} style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}>
                      {exp.position}
                    </h4>
                    <p className={styles.timelineInstitution} style={{ color: darkMode ? '#cbd5e1' : '#374151' }}>
                      {exp.organization}
                      {exp.location ? `, ${exp.location}` : ''}
                    </p>
                    {exp.description && (
                      <ul className={styles.timelineList}>
                        {exp.description.split('\n').map((item, i) => (
                          <li key={i} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div>
            <h3 className={styles.timelineTitle}>Education</h3>
            
            <div className={styles.timeline}>
              {/* Dynamically render education from the database */}
              {cvData?.education?.map((edu, index) => (
                <div className={styles.timelineItem} key={index}>
                  <div className={styles.timelineDot}></div>
                  <div 
                    className={styles.timelineCard}
                    style={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <p className={styles.timelineDate}>
                      {edu.startdate} - {edu.enddate}
                    </p>
                    <h4 className={styles.timelineHeading} style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}>
                      {edu.degree} in {edu.field}
                    </h4>
                    <p className={styles.timelineInstitution} style={{ color: darkMode ? '#cbd5e1' : '#374151' }}>
                      {edu.institution}
                    </p>
                    {edu.grade && (
                      <p className={styles.timelineDescription} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                        GPA: {edu.grade}
                      </p>
                    )}
                    {edu.description && (
                      <p className={styles.timelineDescription} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Skills & Expertise */}
        <div className={styles.skillsContainer}>
          <h3 className={styles.skillsTitle}>Skills & Expertise</h3>
          
          <div className={styles.skillsGrid}>
            {/* Technical Skills */}
            <div 
              className={styles.skillCard}
              style={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={styles.skillIcon}>
                <i className="ri-code-s-slash-line ri-xl"></i>
              </div>
              <h4 className={styles.skillHeading} style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}>Technical Tools</h4>
              <ul className={styles.skillList}>
                {cvData?.technicalSkills?.map((skill, index) => (
                  <li className={styles.skillItem} key={index} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                    <span className={styles.skillBullet}></span>
                    <span>{skill.name} ({skill.level})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Analytical Skills */}
            <div 
              className={styles.skillCard}
              style={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={styles.skillIcon}>
                <i className="ri-bar-chart-line ri-xl"></i>
              </div>
              <h4 className={styles.skillHeading} style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}>Analytical Skills</h4>
              <ul className={styles.skillList}>
                {cvData?.skills?.filter(skill => 
                  ['Data Analysis', 'Predictive Modeling', 'A/B Testing', 'Market Research', 'Customer Segmentation']
                    .some(keyword => skill.includes(keyword))
                ).map((skill, index) => (
                  <li className={styles.skillItem} key={index} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                    <span className={styles.skillBullet}></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Business Skills */}
            <div 
              className={styles.skillCard}
              style={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={styles.skillIcon}>
                <i className="ri-lightbulb-flash-line ri-xl"></i>
              </div>
              <h4 className={styles.skillHeading} style={{ color: darkMode ? '#f8fafc' : '#1f2937' }}>Business Skills</h4>
              <ul className={styles.skillList}>
                {cvData?.skills?.filter(skill => 
                  ['Product Management', 'Product Strategy', 'Scrum Master', 'Digital Marketing', 'Competitive Analysis', 'Consumer Insights']
                    .some(keyword => skill.includes(keyword))
                ).map((skill, index) => (
                  <li className={styles.skillItem} key={index} style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>
                    <span className={styles.skillBullet}></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CV;