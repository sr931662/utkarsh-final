import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Carousel.module.css';

const Carousel = ({ carouselItems = [] }) => {
  const { darkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Filter and sort active items
  const activeItems = (carouselItems || [])
    .filter(item => item?.isActive)
    .sort((a, b) => (a?.order || 0) - (b?.order || 0));

  // Auto-advance with pause on hover
  useEffect(() => {
    if (activeItems.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev === activeItems.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [activeItems.length, isHovered]);
// Add this helper function to properly construct image URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x500?text=Professional+Engagement';
    
    // If it's a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the base URL
    if (imageUrl.startsWith('/')) {
      return `https://utkarsh-x6xa.onrender.com${imageUrl}`;
    }
    
    // For uploaded files, use the uploads directory
    return `https://utkarsh-x6xa.onrender.com/uploads/${imageUrl}`;
  };
  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? activeItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev === activeItems.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0.5
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0.5,
      transition: { duration: 0.6 }
    })
  };

  if (activeItems.length === 0) return null;

  return (
    <section className={`${styles.carouselSection} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.carouselContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Professional Engagements</h2>
          <p className={styles.sectionSubtitle}>Explore my key professional milestones and achievements</p>
        </div>
        
        <div 
          className={styles.carouselWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            className={styles.navButton} 
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <span className={styles.navArrow}>&#8249;</span>
          </button>
          
          <div className={styles.carousel}>
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className={styles.carouselItem}
              >
                <div className={styles.imageContainer}>
                  <div className={styles.imageOverlay}></div>
                  <img 
                    src={getImageUrl(activeItems[currentIndex].imageUrl)}
                    alt={activeItems[currentIndex].title}
                    className={styles.image}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x500?text=Image+Not+Available';
                    }}
                  />
                </div>
                <div className={styles.content}>
                  <div className={styles.contentInner}>
                    <h3 className={styles.itemTitle}>{activeItems[currentIndex].title}</h3>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemVenue}>{activeItems[currentIndex].venue}</span>
                    </div>
                    <p className={styles.itemAchievements}>{activeItems[currentIndex].achievements}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button 
            className={styles.navButton} 
            onClick={handleNext}
            aria-label="Next slide"
          >
            <span className={styles.navArrow}>&#8250;</span>
          </button>
        </div>
        
        {activeItems.length > 1 && (
          <div className={styles.controls}>
            <div className={styles.dots}>
              {activeItems.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <div className={styles.progressBar}>
              <motion.div 
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                key={currentIndex}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Carousel;
