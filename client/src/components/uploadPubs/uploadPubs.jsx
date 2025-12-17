import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../context/ThemeContext';
import styles from './uploadPubs.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileWord, faFileImage, faFileAlt, faCloudUploadAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const LiteratureUploader = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const formRef = useRef();
  const dropzoneRef = useRef();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Animation setup
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none"
      }
    });

    // Initial setup
    gsap.set([titleRef.current, subtitleRef.current, formRef.current], {
      opacity: 0,
      y: 30
    });

    // Animation sequence
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(formRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" }
    );

    // Form input focus animations
    const inputs = formRef.current?.querySelectorAll('input, textarea, select');
    if (inputs) {
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          gsap.to(input, {
            boxShadow: darkMode ? '0 0 0 3px rgba(96, 165, 250, 0.3)' : '0 0 0 3px rgba(47, 220, 232, 0.3)',
            duration: 0.3
          });
        });
        
        input.addEventListener('blur', () => {
          gsap.to(input, {
            boxShadow: 'none',
            duration: 0.3
          });
        });
      });
    }

    // Submit button hover animation
    const submitButton = formRef.current?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.addEventListener('mouseenter', () => {
        gsap.to(submitButton, {
          y: -2,
          duration: 0.2
        });
      });
      
      submitButton.addEventListener('mouseleave', () => {
        gsap.to(submitButton, {
          y: 0,
          duration: 0.2
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(instance => instance.kill());
    };
  }, [darkMode]);

  // Dark mode transitions
  useEffect(() => {
    // Section background transition
    gsap.to(sectionRef.current, {
      backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // Title and subtitle transitions
    gsap.to(titleRef.current, {
      color: darkMode ? '#f8fafc' : '#1f2937',
      duration: 0.6
    });

    gsap.to(subtitleRef.current, {
      color: darkMode ? '#94a3b8' : '#4b5563',
      duration: 0.6
    });

    // Form container transition
    const formContainer = formRef.current;
    if (formContainer) {
      gsap.to(formContainer, {
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        duration: 0.6
      });

      // Form elements
      const formTitle = formContainer.querySelector('h3');
      const formLabels = formContainer.querySelectorAll('label');
      const formInputs = formContainer.querySelectorAll('input, textarea, select');
      
      if (formTitle) gsap.to(formTitle, { color: darkMode ? '#f8fafc' : '#1f2937', duration: 0.6 });
      
      formLabels.forEach(label => {
        gsap.to(label, {
          color: darkMode ? '#e2e8f0' : '#374151',
          duration: 0.6
        });
      });
      
      formInputs.forEach(input => {
        gsap.to(input, {
          backgroundColor: darkMode ? '#334155' : '#ffffff',
          borderColor: darkMode ? '#475569' : '#d1d5db',
          color: darkMode ? '#f8fafc' : '#1f2937',
          duration: 0.6
        });
      });
      
      // Submit button
      const submitButton = formContainer.querySelector('button[type="submit"]');
      if (submitButton) {
        gsap.to(submitButton, {
          backgroundColor: darkMode ? '#60a5fa' : '#2fdce8',
          color: darkMode ? '#0f172a' : '#ffffff',
          duration: 0.6
        });
      }
    }

    // Dropzone transition
    if (dropzoneRef.current) {
      gsap.to(dropzoneRef.current, {
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(249, 250, 251, 0.5)',
        borderColor: darkMode ? '#475569' : '#d1d5db',
        duration: 0.6
      });
    }
  }, [darkMode]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type.startsWith('image/')
    );
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Simulate upload progress
    validFiles.forEach(file => {
      const fileName = file.name;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: progress
        }));
      }, 200);
    });
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = {...prev};
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') return faFilePdf;
    if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
      return faFileWord;
    if (file.type.startsWith('image/')) return faFileImage;
    return faFileAlt;
  };

  const getFileColor = (file) => {
    if (file.type === 'application/pdf') return '#F40F02';
    if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
      return '#2B579A';
    if (file.type.startsWith('image/')) return '#DAA520';
    return '#2fdce8';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission with files
    // console.log('Submitting literature:', files);
    // Here you would typically send the files to your backend
  };

  return (
    <section id="literature-upload" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} ref={titleRef}>Literature Publication Upload</h2>
        <p className={styles.sectionSubtitle} ref={subtitleRef}>
          Share your academic publications, research papers, and scholarly articles with the community.
        </p>
        
        <div className={styles.formContainer} ref={formRef}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>Publication Title</label>
              <input 
                type="text" 
                id="title" 
                className={styles.formInput}
                placeholder="Enter the title of your publication"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="authors" className={styles.formLabel}>Authors</label>
              <input 
                type="text" 
                id="authors" 
                className={styles.formInput}
                placeholder="List all authors separated by commas"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="abstract" className={styles.formLabel}>Abstract</label>
              <textarea 
                id="abstract" 
                rows="5" 
                className={styles.formTextarea}
                placeholder="Provide a brief abstract of your publication"
                required
              ></textarea>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="keywords" className={styles.formLabel}>Keywords</label>
              <input 
                type="text" 
                id="keywords" 
                className={styles.formInput}
                placeholder="Enter relevant keywords separated by commas"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="publicationDate" className={styles.formLabel}>Publication Date</label>
              <input 
                type="date" 
                id="publicationDate" 
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="journal" className={styles.formLabel}>Journal/Conference</label>
              <input 
                type="text" 
                id="journal" 
                className={styles.formInput}
                placeholder="Name of journal or conference"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="doi" className={styles.formLabel}>DOI</label>
              <input 
                type="text" 
                id="doi" 
                className={styles.formInput}
                placeholder="Digital Object Identifier (if available)"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Upload Files</label>
              <div 
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
                ref={dropzoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className={styles.dropzoneContent}>
                  <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadIcon} />
                  <p>Drag & drop your files here or</p>
                  <label htmlFor="file-upload" className={styles.browseButton}>
                    Browse Files
                  </label>
                  <input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    onChange={handleFileInput}
                    className={styles.fileInput}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className={styles.fileTypes}>Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className={styles.fileList}>
                  <h4 className={styles.fileListTitle}>Selected Files:</h4>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index} className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                          <FontAwesomeIcon 
                            icon={getFileIcon(file)} 
                            className={styles.fileIcon} 
                            style={{ color: getFileColor(file) }}
                          />
                          <span className={styles.fileName}>{file.name}</span>
                          <span className={styles.fileSize}>
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <div className={styles.fileActions}>
                          {uploadProgress[file.name] && (
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progressFill}
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                              <span className={styles.progressText}>
                                {Math.round(uploadProgress[file.name])}%
                              </span>
                            </div>
                          )}
                          <button 
                            type="button" 
                            className={styles.removeButton}
                            onClick={() => removeFile(file.name)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="license" className={styles.formLabel}>License</label>
              <select id="license" className={styles.formSelect} required>
                <option value="">Select a license</option>
                <option value="cc-by">Creative Commons Attribution (CC BY)</option>
                <option value="cc-by-sa">Creative Commons Attribution-ShareAlike (CC BY-SA)</option>
                <option value="cc-by-nc">Creative Commons Attribution-NonCommercial (CC BY-NC)</option>
                <option value="cc-by-nc-sa">Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)</option>
                <option value="cc-by-nd">Creative Commons Attribution-NoDerivs (CC BY-ND)</option>
                <option value="cc-by-nc-nd">Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)</option>
                <option value="all-rights-reserved">All Rights Reserved</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" required className={styles.checkboxInput} />
                <span className={styles.checkboxText}>
                  I confirm that I have the right to publish this work and that it complies with all copyright laws.
                </span>
              </label>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Publish Literature
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LiteratureUploader;