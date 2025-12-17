import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../../../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Publications_details.module.css';
import api from '../../../../context/authAPI';

gsap.registerPlugin(ScrollTrigger);

const PublicationsDetail = () => {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sectionRef = useRef();
  const titleRef = useRef();
  const cardRef = useRef();

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/publications/${id}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        const data = response.data;
        let publicationData = data?.data?.publication || data?.publication || data;
        
        if (!publicationData) {
          throw new Error('Publication data not found in response');
        }

        const transformPublication = (pub) => ({
          id: pub._id || id,
          type: pub.type?.toLowerCase() || 'journal',
          year: pub.year || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : 'N/A'),
          title: pub.title || 'Untitled Publication',
          authors: Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || 'Unknown Authors',
          journalOrConference: pub.journalOrConference || 'Unknown Journal',
          journal: pub.journalOrConference || 'Unknown Journal',
          abstract: pub.abstract || 'No abstract available.',
          tags: pub.tags || [],
          citations: pub.citations || 0,
          doi: pub.doi ? (pub.doi.startsWith('10.') ? pub.doi : `10.${pub.doi}`) : null,
          url: pub.url || null,
          pdf: pub.pdf || null,
          volume: pub.volume || 'N/A',
          issue: pub.issue || 'N/A',
          pages: pub.pages || 'N/A',
          publisher: pub.publisher || 'N/A',
          publicationDate: pub.publicationDate || null
        });

        setPublication(transformPublication(publicationData));

      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load publication: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  useEffect(() => {
    if (loading || error) return;

    if (sectionRef.current) {
      gsap.set(sectionRef.current, {
        backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
        '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)'
      });
    }

    if (titleRef.current) {
      gsap.set(titleRef.current, { color: darkMode ? '#f8fafc' : '#1f2937' });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none"
      }
    });

    gsap.set([titleRef.current, cardRef.current], {
      opacity: 0,
      y: 30
    });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(cardRef.current,
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        ease: "back.out(1.2)"
      },
      "-=0.4"
    );

    const handleDarkModeChange = () => {
      gsap.to(sectionRef.current, {
        backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
        duration: 0.8,
        ease: 'power2.inOut'
      });

      gsap.to(titleRef.current, {
        color: darkMode ? '#f8fafc' : '#1f2937',
        duration: 0.6
      });

      gsap.to(sectionRef.current, {
        '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)',
        duration: 0.8
      });
    };

    handleDarkModeChange();

    return () => {
      ScrollTrigger.getAll().forEach(instance => instance.kill());
    };
  }, [darkMode, id, loading, error]);

  if (loading) {
    return (
      <section 
        id="publication-detail" 
        className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
        ref={sectionRef}
      >
        <div className={styles.container}>
          <center>
            <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
          </center>
          <p>Loading publication details...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        id="publication-detail" 
        className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
        ref={sectionRef}
      >
        <div className={styles.container}>
          <center>
            <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
          </center>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!publication) {
    return (
      <section 
        id="publication-detail" 
        className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
        ref={sectionRef}
      >
        <div className={styles.container}>
          <center>
            <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
          </center>
          <p>Publication not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="publication-detail" 
      className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
      ref={sectionRef}
    >
      <div className={styles.container}>
        <a href="/" className={styles.backButton} onClick={(e) => { e.preventDefault(); navigate(-1); }}>
          <i className="ri-arrow-left-line mr-2"></i>
          Back to Publications
        </a>
        
        <center>
          <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
        </center>
        
        <div className={styles.publicationDetailCard} ref={cardRef}>
          <p className={styles.publicationType}>
            {publication.type === 'journal' ? 'Journal Article' : 
             publication.type === 'conference' ? 'Conference Paper' : 
             'Book Chapter'} • {publication.year}
          </p>
          <h3 className={styles.publicationTitle}>{publication.title}</h3>
          <p className={styles.publicationAuthors}>{publication.authors}</p>
          <p className={styles.publicationJournal}>
            {publication.journalOrConference}
            {publication.volume && publication.volume !== 'N/A' && `, Vol. ${publication.volume}`}
            {publication.issue && publication.issue !== 'N/A' && `, Issue ${publication.issue}`}
            {publication.pages && publication.pages !== 'N/A' && `, pp. ${publication.pages}`}
          </p>
          
          <div className={styles.publicationAbstract}>
            <p className={styles.publicationAbstractTitle}>Abstract</p>
            {publication.abstract}
          </div>
          
          {publication.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {publication.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
          
          <div className={styles.detailsContainer}>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Volume</p>
              <p className={styles.detailValue}>{publication.volume}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Issue</p>
              <p className={styles.detailValue}>{publication.issue}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Pages</p>
              <p className={styles.detailValue}>{publication.pages}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Publisher</p>
              <p className={styles.detailValue}>{publication.publisher}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Year</p>
              <p className={styles.detailValue}>{publication.year}</p>
            </div>
            <div className={styles.detailItem}>
              <p className={styles.detailLabel}>Type</p>
              <p className={styles.detailValue}>
                {publication.type === 'journal' ? 'Journal Article' : 
                 publication.type === 'conference' ? 'Conference Paper' : 
                 'Book Chapter'}
              </p>
            </div>
          </div>
          
          <div className={styles.linksContainer}>
            {publication.pdf && (
              <a href={publication.pdf} className={styles.link} target="_blank" rel="noopener noreferrer">
                <i className="ri-file-pdf-line"></i>
                <span>Download PDF</span>
              </a>
            )}
            {publication.url && (
              <a href={publication.url} className={styles.link} target="_blank" rel="noopener noreferrer">
                <i className="ri-external-link-line"></i>
                <span>View Online</span>
              </a>
            )}
            {publication.doi && (
              <a 
                href={`https://doi.org/${publication.doi}`} 
                className={styles.link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="ri-links-line"></i>
                <span>DOI: {publication.doi}</span>
              </a>
            )}
            <a 
              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}`} 
              className={styles.link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i className="ri-search-line"></i>
              <span>Google Scholar</span>
            </a>
          </div>
          
          <div className={styles.citationContainer}>
            <div className={styles.citationBox}>
              <p className={styles.citationLabel}>Citations</p>
              <p className={styles.citationCount}>
                {publication.citations > 0 ? publication.citations : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationsDetail;






































// import React, { useRef, useEffect, useState } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useTheme } from '../../../../context/ThemeContext';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from './Publications_details.module.css';

// // Register ScrollTrigger plugin
// gsap.registerPlugin(ScrollTrigger);

// const PublicationsDetail = () => {
//   const { darkMode } = useTheme();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [publication, setPublication] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Refs for animations
//   const sectionRef = useRef();
//   const titleRef = useRef();
//   const cardRef = useRef();

//   // Fetch publication details
//   useEffect(() => {
//     const fetchPublication = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await fetch(`https://utkarshgupta-1.onrender.com/api/publications/${id}`, {
//           headers: {
//             'Cache-Control': 'no-cache',
//             'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token || ''}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         // console.log('Publication detail API response:', data);

//         // Handle different response formats
//         let publicationData = data?.data?.publication || data?.publication || data;
        
//         if (!publicationData) {
//           throw new Error('Publication data not found in response');
//         }

//         // Transform publication data to consistent format
//         const transformPublication = (pub) => ({
//           id: pub._id || id,
//           type: pub.type?.toLowerCase() || 'journal',
//           year: pub.year || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : 'N/A'),
//           title: pub.title || 'Untitled Publication',
//           authors: Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || 'Unknown Authors',
//           journalOrConference: pub.journalOrConference || 'Unknown Journal',
//           journal: pub.journalOrConference || 'Unknown Journal',
//           abstract: pub.abstract || 'No abstract available.',
//           tags: pub.tags || [],
//           citations: pub.citations || 0,
//           doi: pub.doi ? (pub.doi.startsWith('10.') ? pub.doi : `10.${pub.doi}`) : null,
//           url: pub.url || null,
//           pdf: pub.pdf || null,
//           volume: pub.volume || 'N/A',
//           issue: pub.issue || 'N/A',
//           pages: pub.pages || 'N/A',
//           publisher: pub.publisher || 'N/A',
//           publicationDate: pub.publicationDate || null
//         });

//         setPublication(transformPublication(publicationData));

//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(`Failed to load publication: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPublication();
//   }, [id]);

//   // Animation setup
//   useEffect(() => {
//     if (loading || error) return;

//     // Set initial colors based on darkMode before animations
//     if (sectionRef.current) {
//       gsap.set(sectionRef.current, {
//         backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
//         '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)'
//       });
//     }

//     if (titleRef.current) {
//       gsap.set(titleRef.current, { color: darkMode ? '#f8fafc' : '#1f2937' });
//     }

//     // Animation timeline
//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 75%",
//         toggleActions: "play none none none"
//       }
//     });

//     // Initial setup
//     gsap.set([titleRef.current, cardRef.current], {
//       opacity: 0,
//       y: 30
//     });

//     // Animation sequence
//     tl.fromTo(titleRef.current,
//       { opacity: 0, y: 30 },
//       { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
//     )
//     .fromTo(cardRef.current,
//       { opacity: 0, y: 40 },
//       { 
//         opacity: 1, 
//         y: 0, 
//         duration: 0.6,
//         ease: "back.out(1.2)"
//       },
//       "-=0.4"
//     );

//     // Dark mode transition animation
//     const handleDarkModeChange = () => {
//       // Section background transition
//       gsap.to(sectionRef.current, {
//         backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
//         duration: 0.8,
//         ease: 'power2.inOut'
//       });

//       // Title transition
//       gsap.to(titleRef.current, {
//         color: darkMode ? '#f8fafc' : '#1f2937',
//         duration: 0.6
//       });

//       // Decorative elements transition
//       gsap.to(sectionRef.current, {
//         '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)',
//         duration: 0.8
//       });
//     };

//     handleDarkModeChange();

//     return () => {
//       ScrollTrigger.getAll().forEach(instance => instance.kill());
//     };
//   }, [darkMode, id, loading, error]);

//   if (loading) {
//     return (
//       <section 
//         id="publication-detail" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
//           </center>
//           <p>Loading publication details...</p>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section 
//         id="publication-detail" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
//           </center>
//           <p className={styles.errorMessage}>{error}</p>
//           <button 
//             className={styles.retryButton}
//             onClick={() => window.location.reload()}
//           >
//             Retry
//           </button>
//         </div>
//       </section>
//     );
//   }

//   if (!publication) {
//     return (
//       <section 
//         id="publication-detail" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
//           </center>
//           <p>Publication not found.</p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section 
//       id="publication-detail" 
//       className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//       ref={sectionRef}
//     >
//       <div className={styles.container}>
//         <a href="#" className={styles.backButton} onClick={(e) => { e.preventDefault(); navigate(-1); }}>
//           <i className="ri-arrow-left-line mr-2"></i>
//           Back to Publications
//         </a>
        
//         <center>
//           <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
//         </center>
        
//         <div className={styles.publicationDetailCard} ref={cardRef}>
//           <p className={styles.publicationType}>
//             {publication.type === 'journal' ? 'Journal Article' : 
//              publication.type === 'conference' ? 'Conference Paper' : 
//              'Book Chapter'} • {publication.year}
//           </p>
//           <h3 className={styles.publicationTitle}>{publication.title}</h3>
//           <p className={styles.publicationAuthors}>{publication.authors}</p>
//           <p className={styles.publicationJournal}>
//             {publication.journalOrConference}
//             {publication.volume && publication.volume !== 'N/A' && `, Vol. ${publication.volume}`}
//             {publication.issue && publication.issue !== 'N/A' && `, Issue ${publication.issue}`}
//             {publication.pages && publication.pages !== 'N/A' && `, pp. ${publication.pages}`}
//           </p>
          
//           <div className={styles.publicationAbstract}>
//             <p className={styles.publicationAbstractTitle}>Abstract</p>
//             {publication.abstract}
//           </div>
          
//           {publication.tags.length > 0 && (
//             <div className={styles.tagsContainer}>
//               {publication.tags.map((tag, index) => (
//                 <span key={index} className={styles.tag}>{tag}</span>
//               ))}
//             </div>
//           )}
          
//           <div className={styles.detailsContainer}>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Volume</p>
//               <p className={styles.detailValue}>{publication.volume}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Issue</p>
//               <p className={styles.detailValue}>{publication.issue}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Pages</p>
//               <p className={styles.detailValue}>{publication.pages}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Publisher</p>
//               <p className={styles.detailValue}>{publication.publisher}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Year</p>
//               <p className={styles.detailValue}>{publication.year}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Type</p>
//               <p className={styles.detailValue}>
//                 {publication.type === 'journal' ? 'Journal Article' : 
//                  publication.type === 'conference' ? 'Conference Paper' : 
//                  'Book Chapter'}
//               </p>
//             </div>
//           </div>
          
//           <div className={styles.linksContainer}>
//             {publication.pdf && (
//               <a href={publication.pdf} className={styles.link} target="_blank" rel="noopener noreferrer">
//                 <i className="ri-file-pdf-line"></i>
//                 <span>Download PDF</span>
//               </a>
//             )}
//             {publication.url && (
//               <a href={publication.url} className={styles.link} target="_blank" rel="noopener noreferrer">
//                 <i className="ri-external-link-line"></i>
//                 <span>View Online</span>
//               </a>
//             )}
//             {publication.doi && (
//               <a 
//                 href={`https://doi.org/${publication.doi}`} 
//                 className={styles.link} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//               >
//                 <i className="ri-links-line"></i>
//                 <span>DOI: {publication.doi}</span>
//               </a>
//             )}
//             <a 
//               href={`https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}`} 
//               className={styles.link} 
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               <i className="ri-search-line"></i>
//               <span>Google Scholar</span>
//             </a>
//           </div>
          
//           <div className={styles.citationContainer}>
//             <div className={styles.citationBox}>
//               <p className={styles.citationLabel}>Citations</p>
//               <p className={styles.citationCount}>
//                 {publication.citations > 0 ? publication.citations : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PublicationsDetail;

































// import React, { useRef, useEffect, useState } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useTheme } from '../../../../context/ThemeContext';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from './Publications_details.module.css';

// // Register ScrollTrigger plugin
// gsap.registerPlugin(ScrollTrigger);

// const PublicationsDetail = () => {
//   const { darkMode } = useTheme();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const sectionRef = useRef();
//   const titleRef = useRef();
//   const cardRef = useRef();
  
//   // Publication data - in a real app, this would come from an API or context
//   const publication = {
//     id: 1,
//     type: 'Journal Article',
//     year: '2024',
//     title: 'Neural Mechanisms of Predictive Coding in Visual Cortex',
//     authors: 'Richardson, E., Johnson, K., & Martinez, A.',
//     journal: 'Nature Neuroscience, 27(4), 512-526',
//     abstract: 'This study investigates the neural mechanisms underlying predictive coding in the visual cortex. We combined computational modeling with high-resolution fMRI to demonstrate how the brain generates and updates predictions during visual perception. Our results show distinct patterns of neural activity in early versus higher visual areas, with prediction errors propagating hierarchically through the visual system. These findings provide strong empirical support for predictive coding theories of perception and suggest specific computational roles for different visual areas.',
//     tags: ['Predictive Coding', 'Visual Cortex', 'Neural Computation', 'fMRI', 'Computational Modeling'],
//     citations: 87,
//     doi: '10.1038/s41593-024-01585-8',
//     volume: '27',
//     issue: '4',
//     pages: '512-526',
//     publisher: 'Nature Publishing Group',
//     url: 'https://www.nature.com/articles/s41593-024-01585-8',
//     pdf: '/publications/richardson2024predictive.pdf'
//   };

//   // Animation setup
//   useEffect(() => {
//     // Set initial colors based on darkMode before animations
//     if (sectionRef.current) {
//       gsap.set(sectionRef.current, {
//         backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
//         '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)'
//       });
//     }

//     if (titleRef.current) {
//       gsap.set(titleRef.current, { color: darkMode ? '#f8fafc' : '#1f2937' });
//     }

//     // Animation timeline
//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 75%",
//         toggleActions: "play none none none"
//       }
//     });

//     // Initial setup
//     gsap.set([titleRef.current, cardRef.current], {
//       opacity: 0,
//       y: 30
//     });

//     // Animation sequence
//     tl.fromTo(titleRef.current,
//       { opacity: 0, y: 30 },
//       { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
//     )
//     .fromTo(cardRef.current,
//       { opacity: 0, y: 40 },
//       { 
//         opacity: 1, 
//         y: 0, 
//         duration: 0.6,
//         ease: "back.out(1.2)"
//       },
//       "-=0.4"
//     );

//     // Dark mode transition animation
//     const handleDarkModeChange = () => {
//       // Section background transition
//       gsap.to(sectionRef.current, {
//         backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
//         duration: 0.8,
//         ease: 'power2.inOut'
//       });

//       // Title transition
//       gsap.to(titleRef.current, {
//         color: darkMode ? '#f8fafc' : '#1f2937',
//         duration: 0.6
//       });

//       // Decorative elements transition
//       gsap.to(sectionRef.current, {
//         '--color-decorative': darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(47, 220, 232, 0.05)',
//         duration: 0.8
//       });
//     };

//     handleDarkModeChange();

//     return () => {
//       ScrollTrigger.getAll().forEach(instance => instance.kill());
//     };
//   }, [darkMode, id]);

//   return (
//     <section 
//       id="publication-detail" 
//       className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//       ref={sectionRef}
//     >
//       <div className={styles.container}>
//         <a href="#" className={styles.backButton} onClick={(e) => { e.preventDefault(); navigate(-1); }}>
//           <i className="ri-arrow-left-line mr-2"></i>
//           Back to Publications
//         </a>
        
//         <center>
//           <h2 className={styles.sectionTitle} ref={titleRef}>Publication Details</h2>
//         </center>
        
//         <div className={styles.publicationDetailCard} ref={cardRef}>
//           <p className={styles.publicationType}>{publication.type} • {publication.year}</p>
//           <h3 className={styles.publicationTitle}>{publication.title}</h3>
//           <p className={styles.publicationAuthors}>{publication.authors}</p>
//           <p className={styles.publicationJournal}>{publication.journal}</p>
          
//           <div className={styles.publicationAbstract}>
//             <p className={styles.publicationAbstractTitle}>Abstract</p>
//             {publication.abstract}
//           </div>
          
//           <div className={styles.tagsContainer}>
//             {publication.tags.map((tag, index) => (
//               <span key={index} className={styles.tag}>{tag}</span>
//             ))}
//           </div>
          
//           <div className={styles.detailsContainer}>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Volume</p>
//               <p className={styles.detailValue}>{publication.volume}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Issue</p>
//               <p className={styles.detailValue}>{publication.issue}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Pages</p>
//               <p className={styles.detailValue}>{publication.pages}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Publisher</p>
//               <p className={styles.detailValue}>{publication.publisher}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Year</p>
//               <p className={styles.detailValue}>{publication.year}</p>
//             </div>
//             <div className={styles.detailItem}>
//               <p className={styles.detailLabel}>Type</p>
//               <p className={styles.detailValue}>{publication.type}</p>
//             </div>
//           </div>
          
//           <div className={styles.linksContainer}>
//             <a href={publication.pdf} className={styles.link} target="_blank" rel="noopener noreferrer">
//               <i className="ri-file-pdf-line"></i>
//               <span>Download PDF</span>
//             </a>
//             <a href={publication.url} className={styles.link} target="_blank" rel="noopener noreferrer">
//               <i className="ri-external-link-line"></i>
//               <span>View Online</span>
//             </a>
//             <a href={`https://doi.org/${publication.doi}`} className={styles.link} target="_blank" rel="noopener noreferrer">
//               <i className="ri-links-line"></i>
//               <span>DOI: {publication.doi}</span>
//             </a>
//             <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}`} className={styles.link} target="_blank" rel="noopener noreferrer">
//               <i className="ri-search-line"></i>
//               <span>Google Scholar</span>
//             </a>
//           </div>
          
//           <div className={styles.citationContainer}>
//             <div className={styles.citationBox}>
//               <p className={styles.citationLabel}>Citations</p>
//               <p className={styles.citationCount}>{publication.citations}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PublicationsDetail;