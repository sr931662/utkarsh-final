import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { authAPI } from '../../../context/authAPI';
import { useAuth } from '../../../context/authContext';
import styles from './Hero.module.css';
import { gsap } from 'gsap';
import {
  FiMail,
  FiLinkedin,
  FiGithub,
  FiInstagram,
  FiFacebook
} from 'react-icons/fi';
import { SiOrcid, SiGooglescholar } from 'react-icons/si';

const Hero = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonGroupRef = useRef(null);
  const imageRef = useRef(null);
  const socialRef = useRef(null);

  // Social media links (replace with your actual links)
  const socialLinks = [
    { icon: <FiMail size={20} />, url: 'mailto:utkarsh860818@gmail.com', label: 'Email' },
    { icon: <SiGooglescholar size={20} />, url: 'https://scholar.google.com/citations?user=rmLKXiQAAAAJ&hl=en', label: 'Google Scholar' },
    { icon: <SiOrcid size={20} />, url: 'https://orcid.org/YOUR_ORCID_ID', label: 'ORCID' },
    { icon: <FiLinkedin size={20} />, url: 'https://www.linkedin.com/in/utkarshgupta8/', label: 'LinkedIn' },
    { icon: <FiFacebook size={20} />, url: 'https://www.facebook.com/utkarshgupta8/?locale=pa_IN', label: 'Facebook' },
    { icon: <FiGithub size={20} />, url: 'https://github.com/yourusername', label: 'GitHub' }
  ];

  useEffect(() => {
    const fetchSuperadminProfile = async () => {
      try {
        const response = await authAPI.getPublicSuperadmin();
        const userData = response.data.user || response.data;
        
        const profileImage = userData.profileImage 
          ? `${userData.profileImage}?${new Date().getTime()}`
          : null;
        
        setProfileData({
          ...userData,
          profileImage
        });
        setLoaded(true);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchSuperadminProfile();
  }, [user]);

  useEffect(() => {
    if (loaded) {
      gsap.fromTo(titleRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
      );
      gsap.fromTo(subtitleRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.4 }
      );
      gsap.fromTo(buttonGroupRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.8 }
      );
      gsap.fromTo(imageRef.current, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "elastic.out(1, 0.5)", 
          delay: 0.6 
        }
      );
      gsap.fromTo(socialRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 1.0 }
      );
    }
  }, [loaded]);

  if (!profileData) {
    return (
      <section className={`${styles.hero} ${darkMode ? styles.dark : ''}`} ref={heroRef}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.hero} ${darkMode ? styles.dark : ''}`} ref={heroRef}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.bioinfo} ref={subtitleRef}>
            {`${profileData.bio}`}
          </p>
          <h1 className={styles.title} ref={titleRef}>
            {`${profileData.name}` || 'Utkarsh Gupta'}
          </h1>
          <p className={styles.subtitle} ref={subtitleRef}>
            {profileData.professionalTitle || 'Associate Consultant & Data Analytics Professional'}
          </p>
          <div className={styles.buttonGroup} ref={buttonGroupRef}>
            <a href="#contact" className={styles.primaryButton}>Get in Touch</a>
            <a href="#cv" className={styles.secondaryButton}>View CV</a>
          </div>
          <div className={styles.socialLinks} ref={socialRef}>
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper} ref={imageRef}>
            <img 
              src={`https://utkarsh-x6xa.onrender.com/uploads/Utkarsh-profile.jpg`} 
              alt="Profile Avatar"
              className={styles.myAvatar}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
