import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Publications.module.css';
import { Link } from 'react-router-dom';
import api from '../../../context/authAPI';

gsap.registerPlugin(ScrollTrigger);

const Publications = () => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [publications, setPublications] = useState({
    all: [],
    journal: [],
    conference: [],
    book: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const sectionRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const filterRef = useRef();
  const publicationsRef = useRef([]);
  const viewAllRef = useRef();

  const transformPublication = useCallback((pub) => ({
    id: pub._id,
    type: pub.type?.toLowerCase() || 'journal',
    year: pub.year || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : 2023),
    title: pub.title || 'Untitled Publication',
    authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || 'Unknown Authors'],
    journalOrConference: pub.journalOrConference || 'Unknown Journal',
    tags: pub.tags || [],
    citations: pub.citations || 0,
    doi: pub.doi ? (pub.doi.startsWith('10.') ? `https://doi.org/${pub.doi}` : pub.doi) : null,
    url: pub.url || null,
    volume: pub.volume || '',
    issue: pub.issue || '',
    pages: pub.pages || '',
    abstract: pub.abstract || '',
    publicationDate: pub.publicationDate || new Date().toISOString(),
    pdf: pub.pdf || null
  }), []);

  const fetchPublications = useCallback(async () => {
    try {
      if (!initialLoadComplete) setLoading(true);
      setError(null);
      
      const response = await api.get('/publications', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const data = response.data;
      let publicationsArray = [];
      
      if (data?.data?.publications && Array.isArray(data.data.publications)) {
        publicationsArray = data.data.publications;
      } else if (data?.publications && Array.isArray(data.publications)) {
        publicationsArray = data.publications;
      } else if (Array.isArray(data)) {
        publicationsArray = data;
      } else {
        throw new Error('Invalid publications data format');
      }

      const transformedPublications = {
        all: publicationsArray.map(transformPublication),
        journal: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'journal').map(transformPublication),
        conference: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'conference').map(transformPublication),
        book: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'book-chapter').map(transformPublication)
      };

      setPublications(transformedPublications);
      setInitialLoadComplete(true);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load publications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [transformPublication, initialLoadComplete]);

  useEffect(() => {
    fetchPublications();
    const refreshInterval = setInterval(fetchPublications, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchPublications]);

  useEffect(() => {
    if (loading || error) return;

    // const animatableElements = [
    //   titleRef.current,
    //   subtitleRef.current,
    //   filterRef.current,
    //   ...publicationsRef.current,
    //   viewAllRef.current
    // ].filter(el => el);

    // gsap.set(animatableElements, { autoAlpha: 0, y: 20 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none"
      }
    });

    tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 })
      .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to(filterRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to(publicationsRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1
      }, "-=0.3")
      .to(viewAllRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(instance => instance.kill());
    };
  }, [loading, error, publications, activeTab]);

  useEffect(() => {
    publicationsRef.current = [];
  }, [activeTab]);

  const addToPublicationsRef = (el) => {
    if (el && !publicationsRef.current.includes(el)) {
      publicationsRef.current.push(el);
    }
  };

  if (loading && !initialLoadComplete) {
    return (
      <section 
        id="publications" 
        className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
        ref={sectionRef}
      >
        <div className={styles.container}>
          <center>
            <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
          </center>
          <p className={styles.sectionSubtitle} ref={subtitleRef}>
            Loading publications...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        id="publications" 
        className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
        ref={sectionRef}
      >
        <div className={styles.container}>
          <center>
            <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
          </center>
          <p className={styles.sectionSubtitle} ref={subtitleRef}>
            {error}
          </p>
          <button 
            className={styles.retryButton}
            onClick={fetchPublications}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="publications" 
      className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
      ref={sectionRef}
    >
      <div className={styles.container}>
        <center>
          <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
        </center>
        <p className={`${styles.sectionSubtitle} ${darkMode ? styles.dark : ''}`} ref={subtitleRef}>
          Selected peer-reviewed articles, conference papers, and book chapters from my research career.
        </p>
        
        <div className={styles.filterContainer} ref={filterRef}>
          {['all', 'journal', 'conference', 'book'].map((tab) => (
            <button
              key={tab}
              className={`${styles.filterButton} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All Publications' : 
               tab === 'journal' ? 'Journal Articles' : 
               tab === 'conference' ? 'Conference Papers' : 'Book Chapters'}
            </button>
          ))}
        </div>
        
        <div className={styles.publicationsList}>
          {publications[activeTab].length > 0 ? (
            publications[activeTab].map((publication) => (
              <div 
                key={publication.id} 
                className={styles.publicationCard} 
                ref={addToPublicationsRef}
              >
                <div className={styles.publicationContent}>
                  <p className={styles.publicationType}>
                    {publication.type === 'journal' ? 'Journal Article' : 
                     publication.type === 'conference' ? 'Conference Paper' : 
                     'Book Chapter'} • {publication.year}
                  </p>
                  <h3 className={styles.publicationTitle}>
                    <Link to={`/publications/${publication.id}`}>
                      {publication.title}
                    </Link>
                  </h3>
                  <p className={`${styles.publicationAuthors} ${darkMode ? styles.dark : ''}`}>
                    {publication.authors.join(', ')}
                  </p>
                  <p className={styles.publicationJournal}>
                    {publication.journalOrConference}
                    {publication.volume && `, Vol. ${publication.volume}`}
                    {publication.issue && `, Issue ${publication.issue}`}
                    {publication.pages && `, pp. ${publication.pages}`}
                  </p>
                  {publication.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                      {publication.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className={styles.linksContainer}>
                    {publication.pdf && (
                      <a 
                        href={publication.pdf} 
                        target="_blank"
                        
                        rel="noopener noreferrer" 
                        className={styles.link}
                      >
                        <i className="ri-file-pdf-line"></i>
                        <span>PDF</span>
                      </a>
                    )}
                    {publication.doi && (
                      <a 
                        href={publication.doi} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.link}
                      >
                        <i className="ri-links-line"></i>
                        <span>DOI</span>
                      </a>
                    )}
                  </div>
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
            ))
          ) : (
            <div className={styles.noPublications}>
              <p>No {activeTab === 'all' ? '' : activeTab} publications found.</p>
              {initialLoadComplete && (
                <button 
                  className={styles.retryButton}
                  onClick={fetchPublications}
                >
                  Refresh Publications
                </button>
              )}
            </div>
          )}
        </div>

        {/* {publications.all.length > 0 && (
          <div className={styles.viewAllContainer} ref={viewAllRef}>
            <Link to="/publications" className={styles.viewAllButton}>
              View All Publications
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default Publications;




























// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useTheme } from '../../../context/ThemeContext';
// import styles from './Publications.module.css';
// import { Link } from 'react-router-dom';
// import PublicationsDetail from './publications_detail/Publications_detail';

// gsap.registerPlugin(ScrollTrigger);

// const Publications = () => {
//   const { darkMode } = useTheme();
//   const [activeTab, setActiveTab] = useState('all');
//   const [publications, setPublications] = useState({
//     all: [],
//     journal: [],
//     conference: [],
//     book: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
//   const sectionRef = useRef();
//   const titleRef = useRef();
//   const subtitleRef = useRef();
//   const filterRef = useRef();
//   const publicationsRef = useRef([]);
//   const viewAllRef = useRef();

//   // Transform publication data to consistent format
//   const transformPublication = useCallback((pub) => ({
//     id: pub._id || Math.random().toString(36).substr(2, 9),
//     type: pub.type?.toLowerCase() || 'journal',
//     year: pub.year || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : 2023),
//     title: pub.title || 'Untitled Publication',
//     authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || 'Unknown Authors'],
//     journalOrConference: pub.journalOrConference || 'Unknown Journal',
//     tags: pub.tags || [],
//     citations: pub.citations || 0,
//     doi: pub.doi ? (pub.doi.startsWith('10.') ? `https://doi.org/${pub.doi}` : pub.doi) : null,
//     url: pub.url || null,
//     volume: pub.volume || '',
//     issue: pub.issue || '',
//     pages: pub.pages || '',
//     abstract: pub.abstract || '',
//     publicationDate: pub.publicationDate || new Date().toISOString()
//   }), []);

//   // Fetch publications from backend
//   const fetchPublications = useCallback(async () => {
//     try {
//       if (!initialLoadComplete) setLoading(true);
//       setError(null);
      
//       const response = await fetch('https://utkarshgupta-1.onrender.com/api/publications', {
//         headers: {
//           'Cache-Control': 'no-cache',
//           'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token || ''}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       let publicationsArray = [];
      
//       if (data?.data?.publications && Array.isArray(data.data.publications)) {
//         publicationsArray = data.data.publications;
//       } else if (data?.publications && Array.isArray(data.publications)) {
//         publicationsArray = data.publications;
//       } else if (Array.isArray(data)) {
//         publicationsArray = data;
//       } else {
//         console.warn('Unexpected API response format:', data);
//         throw new Error('Invalid publications data format');
//       }

//       // Organize publications by type
//       const transformedPublications = {
//         all: publicationsArray.map(transformPublication),
//         journal: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'journal').map(transformPublication),
//         conference: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'conference').map(transformPublication),
//         book: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'book').map(transformPublication)
//       };

//       setPublications(transformedPublications);
//       setInitialLoadComplete(true);

//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(`Failed to load publications: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   }, [transformPublication, initialLoadComplete]);

//   // Initial fetch and periodic refresh
//   useEffect(() => {
//     fetchPublications();
    
//     // Set up periodic refresh (every 5 minutes)
//     const refreshInterval = setInterval(fetchPublications, 5 * 60 * 1000);
    
//     return () => clearInterval(refreshInterval);
//   }, [fetchPublications]);

//   // Initialize animations when publications change
//   useEffect(() => {
//     if (loading || error) return;

//     const animatableElements = [
//       titleRef.current,
//       subtitleRef.current,
//       filterRef.current,
//       ...publicationsRef.current,
//       viewAllRef.current
//     ].filter(el => el);

//     gsap.set(animatableElements, { autoAlpha: 0, y: 20 });

//     const tl = gsap.timeline({
//       defaults: { ease: "power3.out" },
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 75%",
//         toggleActions: "play none none none"
//       }
//     });

//     tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 })
//       .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
//       .to(filterRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
//       .to(publicationsRef.current, {
//         autoAlpha: 1,
//         y: 0,
//         duration: 0.6,
//         stagger: 0.1
//       }, "-=0.3")
//       .to(viewAllRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");

//     return () => {
//       tl.kill();
//       ScrollTrigger.getAll().forEach(instance => instance.kill());
//     };
//   }, [loading, error, publications, activeTab]);

//   // Reset publications ref when filter changes
//   useEffect(() => {
//     publicationsRef.current = [];
//   }, [activeTab]);

//   const addToPublicationsRef = (el) => {
//     if (el && !publicationsRef.current.includes(el)) {
//       publicationsRef.current.push(el);
//     }
//   };

//   if (loading && !initialLoadComplete) {
//     return (
//       <section 
//         id="publications" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//           </center>
//           <p className={styles.sectionSubtitle} ref={subtitleRef}>
//             Loading publications...
//           </p>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section 
//         id="publications" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//           </center>
//           <p className={styles.sectionSubtitle} ref={subtitleRef}>
//             {error}
//           </p>
//           <button 
//             className={styles.retryButton}
//             onClick={fetchPublications}
//           >
//             Retry
//           </button>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section 
//       id="publications" 
//       className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//       ref={sectionRef}
//     >
//       <div className={styles.container}>
//         <center>
//           <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//         </center>
//         <p className={`${styles.sectionSubtitle} ${darkMode ? styles.dark : ''}`} ref={subtitleRef}>
//           Selected peer-reviewed articles, conference papers, and book chapters from my research career.
//         </p>
        
//         {/* Publication Filters */}
//         <div className={styles.filterContainer} ref={filterRef}>
//           {['all', 'journal', 'conference', 'book'].map((tab) => (
//             <button
//               key={tab}
//               className={`${styles.filterButton} ${activeTab === tab ? styles.active : ''}`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab === 'all' ? 'All Publications' : 
//                tab === 'journal' ? 'Journal Articles' : 
//                tab === 'conference' ? 'Conference Papers' : 'Book Chapters'}
//             </button>
//           ))}
//         </div>
        
//         {/* Publications List */}
//         <div className={styles.publicationsList}>
//           {publications[activeTab].length > 0 ? (
//             publications[activeTab].map((publication) => (
//               <div 
//                 key={publication.id} 
//                 className={styles.publicationCard} 
//                 ref={addToPublicationsRef}
//               >
//                 <div className={styles.publicationContent}>
//                   <p className={styles.publicationType}>
//                     {publication.type === 'journal' ? 'Journal Article' : 
//                      publication.type === 'conference' ? 'Conference Paper' : 
//                      'Book Chapter'} • {publication.year}
//                   </p>
//                   <h3 className={styles.publicationTitle}>
//                     {publication.url ? (
//                       <a href={PublicationsDetail} target="_blank" rel="noopener noreferrer">
//                         {publication.title}
//                       </a>
//                     ) : (
//                       publication.title
//                     )}
//                   </h3>
//                   <p className={`${styles.publicationAuthors} ${darkMode ? styles.dark : ''}`}>
//                     {publication.authors.join(', ')}
//                   </p>
//                   <p className={styles.publicationJournal}>
//                     {publication.journalOrConference}
//                     {publication.volume && `, Vol. ${publication.volume}`}
//                     {publication.issue && `, Issue ${publication.issue}`}
//                     {publication.pages && `, pp. ${publication.pages}`}
//                   </p>
//                   {publication.tags.length > 0 && (
//                     <div className={styles.tagsContainer}>
//                       {publication.tags.map((tag, index) => (
//                         <span key={index} className={styles.tag}>{tag}</span>
//                       ))}
//                     </div>
//                   )}
//                   <div className={styles.linksContainer}>
//                     {publication.url && (
//                       <a 
//                         href={publication.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className={styles.link}
//                       >
//                         <i className="ri-file-pdf-line"></i>
//                         <span>View Publication</span>
//                       </a>
//                     )}
//                     {publication.doi && (
//                       <a 
//                         href={publication.doi} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className={styles.link}
//                       >
//                         <i className="ri-links-line"></i>
//                         <span>DOI</span>
//                       </a>
//                     )}
//                   </div>
//                 </div>
//                 <div className={styles.citationContainer}>
//                   <div className={styles.citationBox}>
//                     <p className={styles.citationLabel}>Citations</p>
//                     <p className={styles.citationCount}>
//                       {publication.citations > 0 ? publication.citations : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className={styles.noPublications}>
//               <p>No {activeTab === 'all' ? '' : activeTab} publications found.</p>
//               {initialLoadComplete && (
//                 <button 
//                   className={styles.retryButton}
//                   onClick={fetchPublications}
//                 >
//                   Refresh Publications
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {publications.all.length > 0 && (
//           <div className={styles.viewAllContainer} ref={viewAllRef}>
//             <Link to="/publications" className={styles.viewAllButton}>
//               View All Publications
//               <i className="ri-arrow-right-line"></i>
//             </Link>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Publications;


































// import React, { useRef, useEffect, useState } from 'react';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useTheme } from '../../../context/ThemeContext';
// import styles from './Publications.module.css';
// import { Link } from 'react-router-dom';

// // Register ScrollTrigger plugin
// gsap.registerPlugin(ScrollTrigger);

// const Publications = () => {
//   const { darkMode } = useTheme();
//   const [activeTab, setActiveTab] = useState('all');
//   const [publications, setPublications] = useState({
//     all: [],
//     journal: [],
//     conference: [],
//     book: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Refs for GSAP animations
//   const sectionRef = useRef();
//   const titleRef = useRef();
//   const subtitleRef = useRef();
//   const filterRef = useRef();
//   const publicationsRef = useRef([]);
//   const viewAllRef = useRef();

//   // Fetch publications from backend
//   useEffect(() => {
//     const fetchPublications = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await fetch('https://utkarshgupta-1.onrender.com/api/publications', {
//           headers: {
//             'Cache-Control': 'no-cache',
//             'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token || ''}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();

//         // Handle different response formats
//         let publicationsArray = [];
        
//         if (data?.data?.publications && Array.isArray(data.data.publications)) {
//           publicationsArray = data.data.publications;
//         } else if (data?.publications && Array.isArray(data.publications)) {
//           publicationsArray = data.publications;
//         } else if (Array.isArray(data)) {
//           publicationsArray = data;
//         } else {
//           console.warn('Unexpected API response format:', data);
//           throw new Error('Invalid publications data format');
//         }

//         // Transform publication data to consistent format
//         const transformPublication = (pub) => ({
//           id: pub._id || Math.random().toString(36).substr(2, 9),
//           type: pub.type?.toLowerCase() || 'journal',
//           year: pub.year || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : 2023),
//           title: pub.title || 'Untitled Publication',
//           authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors || 'Unknown Authors'],
//           journalOrConference: pub.journalOrConference || 'Unknown Journal',
//           tags: pub.tags || [],
//           citations: pub.citations || 0,
//           doi: pub.doi ? (pub.doi.startsWith('10.') ? `https://doi.org/${pub.doi}` : pub.doi) : null,
//           url: pub.url || null,
//           volume: pub.volume || '',
//           issue: pub.issue || '',
//           pages: pub.pages || '',
//           abstract: pub.abstract || '',
//           publicationDate: pub.publicationDate || new Date().toISOString()
//         });

//         // Organize publications by type
//         const transformedPublications = {
//           all: publicationsArray.map(transformPublication),
//           journal: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'journal').map(transformPublication),
//           conference: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'conference').map(transformPublication),
//           book: publicationsArray.filter(pub => pub.type?.toLowerCase() === 'book').map(transformPublication)
//         };

//         setPublications(transformedPublications);

//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(`Failed to load publications: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPublications();
//   }, []);

//   // Initialize animations
//   useEffect(() => {
//     if (loading || error) return;

//     const animatableElements = [
//       titleRef.current,
//       subtitleRef.current,
//       filterRef.current,
//       ...publicationsRef.current,
//       viewAllRef.current
//     ].filter(el => el);

//     gsap.set(animatableElements, { autoAlpha: 0, y: 20 });

//     const tl = gsap.timeline({
//       defaults: { ease: "power3.out" },
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 75%",
//         toggleActions: "play none none none"
//       }
//     });

//     tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 })
//       .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
//       .to(filterRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
//       .to(publicationsRef.current, {
//         autoAlpha: 1,
//         y: 0,
//         duration: 0.6,
//         stagger: 0.1
//       }, "-=0.3")
//       .to(viewAllRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");

//     return () => {
//       tl.kill();
//       ScrollTrigger.getAll().forEach(instance => instance.kill());
//     };
//   }, [loading, error, publications]);

//   // Add publication to ref array
//   const addToPublicationsRef = (el) => {
//     if (el && !publicationsRef.current.includes(el)) {
//       publicationsRef.current.push(el);
//     }
//   };

//   if (loading) {
//     return (
//       <section 
//         id="publications" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//           </center>
//           <p className={styles.sectionSubtitle} ref={subtitleRef}>
//             Loading publications...
//           </p>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section 
//         id="publications" 
//         className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//         ref={sectionRef}
//       >
//         <div className={styles.container}>
//           <center>
//             <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//           </center>
//           <p className={styles.sectionSubtitle} ref={subtitleRef}>
//             {error}
//           </p>
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

//   return (
//     <section 
//       id="publications" 
//       className={`${styles.section} ${darkMode ? styles.dark : ''}`} 
//       ref={sectionRef}
//     >
//       <div className={styles.container}>
//         <center>
//           <h2 className={styles.sectionTitle} ref={titleRef}>Publications</h2>
//         </center>
//         <p className={`${styles.sectionSubtitle} ${darkMode ? styles.dark : ''}`} ref={subtitleRef}>
//           Selected peer-reviewed articles, conference papers, and book chapters from my research career.
//         </p>
        
//         {/* Publication Filters */}
//         <div className={styles.filterContainer} ref={filterRef}>
//           {['all', 'journal', 'conference', 'book'].map((tab) => (
//             <button
//               key={tab}
//               className={`${styles.filterButton} ${activeTab === tab ? styles.active : ''}`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab === 'all' ? 'All Publications' : 
//                tab === 'journal' ? 'Journal Articles' : 
//                tab === 'conference' ? 'Conference Papers' : 'Book Chapters'}
//             </button>
//           ))}
//         </div>
        
//         {/* Publications List */}
//         <div className={styles.publicationsList}>
//           {publications[activeTab].length > 0 ? (
//             publications[activeTab].map((publication) => (
//               <div 
//                 key={publication.id} 
//                 className={styles.publicationCard} 
//                 ref={addToPublicationsRef}
//               >
//                 <div className={styles.publicationContent}>
//                   <p className={styles.publicationType}>
//                     {publication.type === 'journal' ? 'Journal Article' : 
//                      publication.type === 'conference' ? 'Conference Paper' : 
//                      'Book Chapter'} • {publication.year}
//                   </p>
//                   <h3 className={styles.publicationTitle}>
//                     {publication.id ? (
//                       <Link to={publication.url}>{publication.title}</Link>
//                     ) : (
//                       publication.title
//                     )}
//                   </h3>
//                   <p className={`${styles.publicationAuthors} ${darkMode ? styles.dark : ''}`}>
//                     {publication.authors.join(', ')}
//                   </p>
//                   <p className={styles.publicationJournal}>
//                     {publication.journalOrConference}
//                     {publication.volume && `, Vol. ${publication.volume}`}
//                     {publication.issue && `, Issue ${publication.issue}`}
//                     {publication.pages && `, pp. ${publication.pages}`}
//                   </p>
//                   {publication.tags.length > 0 && (
//                     <div className={styles.tagsContainer}>
//                       {publication.tags.map((tag, index) => (
//                         <span key={index} className={styles.tag}>{tag}</span>
//                       ))}
//                     </div>
//                   )}
//                   <div className={styles.linksContainer}>
//                     {publication.url && (
//                       <a 
//                         href={publication.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className={styles.link}
//                       >
//                         <i className="ri-file-pdf-line"></i>
//                         <span>View Publication</span>
//                       </a>
//                     )}
//                     {publication.doi && (
//                       <a 
//                         href={publication.doi} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className={styles.link}
//                       >
//                         <i className="ri-links-line"></i>
//                         <span>DOI</span>
//                       </a>
//                     )}
//                   </div>
//                 </div>
//                 <div className={styles.citationContainer}>
//                   <div className={styles.citationBox}>
//                     <p className={styles.citationLabel}>Citations</p>
//                     <p className={styles.citationCount}>
//                       {publication.citations > 0 ? publication.citations : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className={styles.noPublications}>
//               <p>No {activeTab === 'all' ? '' : activeTab} publications found.</p>
//             </div>
//           )}
//         </div>

//         {publications.all.length > 0 && (
//           <div className={styles.viewAllContainer} ref={viewAllRef}>
//             <Link to="/publications" className={styles.viewAllButton}>
//               View All Publications
//               <i className="ri-arrow-right-line"></i>
//             </Link>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Publications;