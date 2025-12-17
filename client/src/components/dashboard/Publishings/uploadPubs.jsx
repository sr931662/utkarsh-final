import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
import styles from './uploadPubs.module.css';
import { FiLink, FiFileText, FiCheck, FiPlus, FiMinus, FiCalendar, FiUser } from 'react-icons/fi';

const UploadPublications = () => {
  const { darkMode } = useTheme();
  const [publicationUrl, setPublicationUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    authors: [''],
    publicationDate: '',
    abstract: '',
    keywords: '',
    doi: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    type: 'journal'
  });

  const handleUrlChange = (e) => {
    setPublicationUrl(e.target.value);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthorChange = (index, value) => {
    const updatedAuthors = [...metadata.authors];
    updatedAuthors[index] = value;
    setMetadata(prev => ({ ...prev, authors: updatedAuthors }));
  };

  const addAuthorField = () => {
    setMetadata(prev => ({ ...prev, authors: [...prev.authors, ''] }));
  };

  const removeAuthorField = (index) => {
    if (metadata.authors.length > 1) {
      const updatedAuthors = [...metadata.authors];
      updatedAuthors.splice(index, 1);
      setMetadata(prev => ({ ...prev, authors: updatedAuthors }));
    }
  };

  const handleUpload = async () => {
    if (!isValidUrl(publicationUrl)) {
      alert('Please enter a valid URL for the publication');
      return;
    }

    try {
      setUploadProgress(0);
      setUploadComplete(false);

      const authData = JSON.parse(localStorage.getItem('auth'));
      const token = authData?.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/publications/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: metadata.title,
          authors: metadata.authors.filter(a => a.trim() !== ''),
          year: new Date(metadata.publicationDate).getFullYear(),
          publicationDate: metadata.publicationDate,
          abstract: metadata.abstract,
          tags: metadata.keywords,
          doi: metadata.doi,
          journalOrConference: metadata.journal,
          volume: metadata.volume,
          issue: metadata.issue,
          pages: metadata.pages,
          type: metadata.type,
          isFeatured: false,
          url: publicationUrl
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload success:', result);
        setUploadProgress(100);
        setUploadComplete(true);
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert(`An error occurred during upload: ${error.message}`);
    }
  };

  const resetForm = () => {
    setPublicationUrl('');
    setUploadProgress(null);
    setUploadComplete(false);
    setMetadata({
      title: '',
      authors: [''],
      publicationDate: '',
      abstract: '',
      keywords: '',
      doi: '',
      journal: '',
      volume: '',
      issue: '',
      pages: '',
      type: 'journal'
    });
  };

  return (
    <div id='upload-content' className={`${styles.uploadContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.header}>
        <h1><FiLink size={24} /> Add New Publication</h1>
        <p>Add your research publications by providing their online links</p>
      </div>

      <div className={styles.uploadGrid}>
        {/* URL Input Section */}
        

        {/* Metadata Form Section */}
        <motion.div 
          className={styles.metadataSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2><FiFileText size={20} /> Publication Metadata</h2>
          
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              placeholder="Enter publication title"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>URL *</label>
              <div className={styles.urlInputBox}>
                
                <div className={styles.urlInputGroup}>
                  <input
                    type="url"
                    value={publicationUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/publication.pdf"
                    className={styles.urlInput}
                    required
                  />
                </div>
              </div>
            <label>Authors *</label>
            {metadata.authors.map((author, index) => (
              <div key={index} className={styles.authorInput}>
                <FiUser size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => handleAuthorChange(index, e.target.value)}
                  placeholder={`Author ${index + 1} name`}
                  required
                />
                {metadata.authors.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeAuthorField(index)}
                    className={styles.authorRemoveButton}
                  >
                    <FiMinus size={16} />
                  </button>
                )}
                {index === metadata.authors.length - 1 && (
                  <button 
                    type="button" 
                    onClick={addAuthorField}
                    className={styles.authorAddButton}
                  >
                    <FiPlus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Publication Date *</label>
              <div className={styles.dateInput}>
                <FiCalendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  name="publicationDate"
                  value={metadata.publicationDate}
                  onChange={handleMetadataChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>DOI</label>
              <input
                type="text"
                name="doi"
                value={metadata.doi}
                onChange={handleMetadataChange}
                placeholder="e.g. 10.1234/abcd"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Abstract *</label>
            <textarea
              name="abstract"
              value={metadata.abstract}
              onChange={handleMetadataChange}
              placeholder="Enter publication abstract"
              rows="4"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Keywords</label>
            <input
              type="text"
              name="keywords"
              value={metadata.keywords}
              onChange={handleMetadataChange}
              placeholder="Comma-separated keywords"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Journal/Conference *</label>
              <input
                type="text"
                name="journal"
                value={metadata.journal}
                className={styles.inputAuto}
                onChange={handleMetadataChange}
                placeholder="Journal or conference name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Volume</label>
              <input
                type="text"
                name="volume"
                className={styles.inputAuto}
                value={metadata.volume}
                onChange={handleMetadataChange}
                placeholder="Volume number"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Issue</label>
              <input
                type="text"
                name="issue"
                value={metadata.issue}
                className={styles.inputAuto}
                onChange={handleMetadataChange}
                placeholder="Issue number"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Pages</label>
              <input
                type="text"
                name="pages"
                value={metadata.pages}
                className={styles.inputAuto}
                onChange={handleMetadataChange}
                placeholder="e.g. 123-130"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Progress and Actions */}
      <motion.div 
        className={styles.actionSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {uploadProgress !== null && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {uploadProgress}% {uploadComplete ? 'Upload Complete!' : 'Uploading...'}
            </span>
            {uploadComplete && (
              <div className={styles.successMessage}>
                <FiCheck size={20} /> Publication successfully added!
              </div>
            )}
          </div>
        )}

        <div className={styles.actionButtons}>
          <button 
            className={styles.resetButton}
            onClick={resetForm}
          >
            Reset Form
          </button>
          <button 
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={
              !publicationUrl || 
              !metadata.title || 
              !metadata.authors[0] || 
              !metadata.publicationDate || 
              !metadata.abstract ||
              !metadata.journal
            }
          >
            Add Publication
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPublications;