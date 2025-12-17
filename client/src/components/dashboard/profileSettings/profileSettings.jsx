import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/authContext';
import { motion } from 'framer-motion';
import styles from './profileSettings.module.css';
// const handleCarouselItemChange = (index, field, value) => {
//   setFormData(prev => {
//     const updatedItems = [...prev.carouselItems];
    
//     if (field === 'imageUrl' && value instanceof File) {
//       // Create a preview URL for the file
//       const previewUrl = URL.createObjectURL(value);
//       updatedItems[index] = {
//         ...updatedItems[index],
//         [field]: value,
//         imagePreview: previewUrl // Store preview separately
//       };
//     } else {
//       updatedItems[index] = {
//         ...updatedItems[index],
//         [field]: value
//       };
//     }
    
//     return {
//       ...prev,
//       carouselItems: updatedItems
//     };
//   });
// };
import { authAPI } from '../../../context/authAPI';
import { 
  FiUser, FiMail, FiSave, FiEdit, FiCamera,
  FiLinkedin, FiGithub, FiTwitter, FiCalendar,
  FiMapPin, FiPhone,
  FiHome, FiClock
} from 'react-icons/fi';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiToggleRight, FiUpload, FiToggleLeft } from 'react-icons/fi';


const ProfileSettings = () => {
  const { darkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  
  // Add this helper function at the top
  const prepareFormData = (formData, avatarFile) => {
    const formDataToSend = new FormData();
    
    // Handle file upload if avatar changed
    if (avatarFile) {
      formDataToSend.append('profileImage', avatarFile);
    }

    // Add all other fields
    Object.keys(formData).forEach(key => {
      if (key === 'profileImage') return; // Skip as we handle separately
      
      if (typeof formData[key] === 'object' && formData[key] !== null) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== undefined && formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    return formDataToSend;
  };
  // Add this useEffect to clean up object URLs
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      formData.carouselItems?.forEach(item => {
        if (item.imagePreview) {
          URL.revokeObjectURL(item.imagePreview);
        }
      });
    };
  }, []);
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    professionalTitle: "",
    profileImage: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    alternateEmail: "",
    bio: "",
    carouselItems: [],
    socialMedia: { twitter: "", linkedin: "", github: "", researchGate: "", googleScholar: "", ORCID: "" },
    affiliation: { institution: "", department: "", position: "", faculty: "", joiningDate: "", officeLocation: "", officeHours: "" },
    location: { address: "", city: "", state: "", country: "", postalCode: "", timeZone: "" },
    education: [],
    crashcourses: [],
    workExperience: [],
    awards: [],
    researchInterests: [],
    teachingInterests: [],
    skills: [],
    technicalSkills: [],
    languages: [],
    hobbies: [],
    certificates: [],
    notificationPreferences: { emailNotifications: true, pushNotifications: true }
  });

  
// Add this useEffect for loading carousel data
// useEffect(() => {
//     const loadUserData = async () => {
//       setIsLoading(true);
//       try {
//         const response = await authAPI.getMe();
//         const userData = response.data?.user || response.user;

//         if (!userData) throw new Error("User data not found");

//         setFormData((prev) => ({
//           ...prev,
//           ...userData,
//           carouselItems: userData.carouselItems || [],
//           socialMedia: userData.socialMedia || prev.socialMedia,
//           affiliation: userData.affiliation || prev.affiliation,
//           location: userData.location || prev.location,
//           notificationPreferences: userData.notificationPreferences || prev.notificationPreferences
//         }));
//       } catch (err) {
//         console.error("Failed to load user data:", err);
//         alert(err.message || "Failed to load profile data");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (user) loadUserData();
//   }, [user]);

  // Add new state for carousel item:
  const [newCarouselItem, setNewCarouselItem] = useState({
    title: '',
    venue: '',
    achievements: '',
    imageUrl: '',
    isActive: true
  });

  // Update the handleCarouselItemChange function
const handleCarouselItemChange = (index, field, value) => {
  setFormData(prev => {
    const updatedItems = [...prev.carouselItems];
    
    if (field === 'imageUrl' && value instanceof File) {
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(value);
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
        imagePreview: previewUrl // Store preview separately
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    return {
      ...prev,
      carouselItems: updatedItems
    };
  });
};

  // Add function to add new carousel item:
  const addCarouselItem = () => {
    setFormData(prev => ({
      ...prev,
      carouselItems: [
        ...prev.carouselItems,
        {
          title: '',
          venue: '',
          achievements: '',
          imageUrl: '',
          isActive: true,
          order: prev.carouselItems.length
        }
      ]
    }));
  };

  // Add function to remove carousel item:
  const removeCarouselItem = (index) => {
    setFormData(prev => ({
      ...prev,
      carouselItems: prev.carouselItems.filter((_, i) => i !== index)
    }));
  };

  // Add function to reorder items:
  const moveCarouselItem = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.carouselItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setFormData(prev => {
      const items = [...prev.carouselItems];
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return {
        ...prev,
        carouselItems: items.map((item, idx) => ({
          ...item,
          order: idx
        }))
      };
    });
  };

  // Add function to toggle active status:
  const toggleCarouselItemActive = (index) => {
    setFormData(prev => {
      const updatedItems = [...prev.carouselItems];
      updatedItems[index] = {
        ...updatedItems[index],
        isActive: !updatedItems[index].isActive
      };
      return {
        ...prev,
        carouselItems: updatedItems
      };
    });
  };

  // Temporary form states for adding new items
  const [newEducation, setNewEducation] = useState({
    degree: '',
    field: '',
    institution: '',
    grade: '',
    startdate: '',
    enddate: '',
    description: ''
  });
  
  const [newCrashCourse, setNewCrashCourse] = useState({
    course: '',
    field: '',
    organization: ''
  });
  
  const [newWorkExperience, setNewWorkExperience] = useState({
    position: '',
    organization: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
  const [newAward, setNewAward] = useState({
    title: '',
    year: '',
    description: ''
  });
  
  const [newTechnicalSkill, setNewTechnicalSkill] = useState({
    name: '',
    level: 'intermediate'
  });
  
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    proficiency: 'professional'
  });
  
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    organization: '',
    issueDate: '',
    certID: '',
    credentialslink: ''
  });
  
  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [newTeachingInterest, setNewTeachingInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newHobby, setNewHobby] = useState('');

  const [avatarPreview, setAvatarPreview] = useState(null);


// Load user data
useEffect(() => {
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Use your authAPI instead of direct axios call
      const response = await authAPI.getMe();
      
      // Check if response has data and user properties
      const userData = response?.user || response?.data?.user || response;
      
      if (!userData) {
        throw new Error('User data not found in response');
      }

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        professionalTitle: userData.professionalTitle || '',
        profileImage: userData.profileImage || '',
        gender: userData.gender || '',
        dateOfBirth: userData.dateOfBirth || '',
        phoneNumber: userData.phoneNumber || '',
        alternateEmail: userData.alternateEmail || '',
        bio: userData.bio || '',
        carouselItems: userData.carouselItems || [], // Ensure array
        
        socialMedia: userData.socialMedia || {
          twitter: '',
          linkedin: '',
          github: '',
          researchGate: '',
          googleScholar: '',
          ORCID: ''
        },
        
        affiliation: userData.affiliation || {
          institution: '',
          department: '',
          position: '',
          faculty: '',
          joiningDate: '',
          officeLocation: '',
          officeHours: ''
        },
        
        location: userData.location || {
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          timeZone: ''
        },
        
        education: userData.education || [],
        crashcourses: userData.crashcourses || [],
        workExperience: userData.workExperience || [],
        awards: userData.awards || [],
        researchInterests: userData.researchInterests || [],
        teachingInterests: userData.teachingInterests || [],
        skills: userData.skills || [],
        technicalSkills: userData.technicalSkills || [],
        languages: userData.languages || [],
        hobbies: userData.hobbies || [],
        certificates: userData.certificates || [],
        
        notificationPreferences: userData.notificationPreferences || {
          emailNotifications: true,
          pushNotifications: true
        }
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      alert(error.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    loadUserData();
  }
}, [user]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };


  const handleAffiliationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      affiliation: {
        ...prev.affiliation,
        [name]: value
      }
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handleNotificationPrefChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: checked
      }
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleCrashCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCrashCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewWorkExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAwardChange = (e) => {
    const { name, value } = e.target;
    setNewAward(prev => ({ ...prev, [name]: value }));
  };

  const handleTechnicalSkillChange = (e) => {
    const { name, value } = e.target;
    setNewTechnicalSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e) => {
    const { name, value } = e.target;
    setNewLanguage(prev => ({ ...prev, [name]: value }));
  };

  const handleCertificateChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Helper functions for date handling
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const parseInputDate = (inputDate) => {
    if (!inputDate) return null;
    const date = new Date(inputDate);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  // Helper function to convert yyyy-MM-dd to ISO format
  const parseInputDateToISO = (inputDate) => {
    if (!inputDate) return null;
    return new Date(inputDate).toISOString();
  };

  // Array item handlers
  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
      setNewEducation({
        degree: '',
        field: '',
        institution: '',
        grade: '',
        startdate: '',
        enddate: '',
        description: ''
      });
    }
  };

  const addCrashCourse = () => {
    if (newCrashCourse.course && newCrashCourse.organization) {
      setFormData(prev => ({
        ...prev,
        crashcourses: [...prev.crashcourses, newCrashCourse]
      }));
      setNewCrashCourse({
        course: '',
        field: '',
        organization: ''
      });
    }
  };

  const addWorkExperience = () => {
    if (newWorkExperience.position && newWorkExperience.organization) {
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, newWorkExperience]
      }));
      setNewWorkExperience({
        position: '',
        organization: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    }
  };

  const addAward = () => {
    if (newAward.title && newAward.year) {
      setFormData(prev => ({
        ...prev,
        awards: [...prev.awards, newAward]
      }));
      setNewAward({
        title: '',
        year: '',
        description: ''
      });
    }
  };

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.name) {
      setFormData(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newTechnicalSkill]
      }));
      setNewTechnicalSkill({
        name: '',
        level: 'intermediate'
      });
    }
  };

  const addLanguage = () => {
    if (newLanguage.name) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage({
        name: '',
        proficiency: 'professional'
      });
    }
  };

  const addCertificate = () => {
    if (newCertificate.title && newCertificate.organization) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate]
      }));
      setNewCertificate({
        title: '',
        organization: '',
        issueDate: '',
        certID: '',
        credentialslink: ''
      });
    }
  };

  const addResearchInterest = () => {
    if (newResearchInterest.trim() && !formData.researchInterests.includes(newResearchInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        researchInterests: [...prev.researchInterests, newResearchInterest.trim()]
      }));
      setNewResearchInterest('');
    }
  };

  const addTeachingInterest = () => {
    if (newTeachingInterest.trim() && !formData.teachingInterests.includes(newTeachingInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        teachingInterests: [...prev.teachingInterests, newTeachingInterest.trim()]
      }));
      setNewTeachingInterest('');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  // Remove items from arrays
  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeCrashCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      crashcourses: prev.crashcourses.filter((_, i) => i !== index)
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const removeAward = (index) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  const removeTechnicalSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((_, i) => i !== index)
    }));
  };

  const removeLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const removeResearchInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter(i => i !== interest)
    }));
  };

  const removeTeachingInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      teachingInterests: prev.teachingInterests.filter(i => i !== interest)
    }));
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const removeHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

// // Update the handleSubmit function
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!formData.name || !formData.email) {
//     alert("Name and Email are required");
//     return;
//   }

//   setIsSaving(true);
//   try {
//     const fd = new FormData();

//     // Handle profile image upload if changed
//     if (avatarPreview && avatarPreview !== formData.profileImage) {
//       if (avatarPreview.startsWith('data:')) {
//         const blob = await fetch(avatarPreview).then(r => r.blob());
//         fd.append('profileImage', blob, 'Utkarsh-profile.jpg');
//       }
//     }

//     // Prepare the data structure to match your schema
//     const preparedData = {
//       name: formData.name,
//       email: formData.email,
//       professionalTitle: formData.professionalTitle || '',
//       gender: formData.gender || '',
//       dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
//       phoneNumber: formData.phoneNumber || '',
//       alternateEmail: formData.alternateEmail || '',
//       bio: formData.bio || '',
//       socialMedia: formData.socialMedia || {},
//       affiliation: {
//         institution: formData.affiliation?.institution || '',
//         department: formData.affiliation?.department || '',
//         position: formData.affiliation?.position || '',
//         faculty: formData.affiliation?.faculty || '',
//         joiningDate: formData.affiliation?.joiningDate ? new Date(formData.affiliation.joiningDate).toISOString() : null,
//         officeLocation: formData.affiliation?.officeLocation || '',
//         officeHours: formData.affiliation?.officeHours || ''
//       },
//       location: {
//         address: formData.location?.address || '',
//         city: formData.location?.city || '',
//         state: formData.location?.state || '',
//         country: formData.location?.country || '',
//         postalCode: formData.location?.postalCode || '',
//         timeZone: formData.location?.timeZone || ''
//       },
//       notificationPreferences: {
//         emailNotifications: formData.notificationPreferences?.emailNotifications !== false,
//         pushNotifications: formData.notificationPreferences?.pushNotifications !== false
//       },
//       // Handle array fields with proper defaults
//       education: formData.education?.map(edu => ({
//         degree: edu.degree || '',
//         field: edu.field || '',
//         institution: edu.institution || '',
//         grade: edu.grade || '',
//         startdate: edu.startdate || '',
//         enddate: edu.enddate || '',
//         description: edu.description || ''
//       })) || [],
//       workExperience: formData.workExperience?.map(exp => ({
//         position: exp.position || '',
//         organization: exp.organization || '',
//         startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
//         endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
//         current: exp.current || false,
//         description: exp.description || ''
//       })) || [],
//       awards: formData.awards?.map(award => ({
//         title: award.title || '',
//         year: award.year || '',
//         description: award.description || ''
//       })) || [],
//       researchInterests: formData.researchInterests || [],
//       teachingInterests: formData.teachingInterests || [],
//       skills: formData.skills || [],
//       technicalSkills: formData.technicalSkills?.map(skill => ({
//         name: skill.name || '',
//         level: skill.level || 'intermediate'
//       })) || [],
//       languages: formData.languages?.map(lang => ({
//         name: lang.name || '',
//         proficiency: lang.proficiency || 'professional'
//       })) || [],
//       hobbies: formData.hobbies || [],
//       certificates: formData.certificates?.map(cert => ({
//         title: cert.title || '',
//         organization: cert.organization || '',
//         issueDate: cert.issueDate || '',
//         certID: cert.certID || '',
//         credentialslink: cert.credentialslink || ''
//       })) || [],
//       carouselItems: formData.carouselItems?.map(item => ({
//         title: item.title || '',
//         venue: item.venue || '',
//         achievements: item.achievements || '',
//         imageUrl: item.imageUrl || '',
//         isActive: item.isActive !== false,
//         order: item.order || 0
//       })) || []
//     };

//     // Handle carousel image file uploads
//     formData.carouselItems?.forEach((item, index) => {
//       if (item.imageUrl instanceof File) {
//         fd.append('carouselImage', item.imageUrl);
//         preparedData.carouselItems[index].imageUrl = `/uploads/${item.imageUrl.name}`;
//       }
//     });

//     // Append all fields to FormData
//     Object.entries(preparedData).forEach(([key, value]) => {
//       if (key === 'profileImage') return; // Already handled
//       if (typeof value === 'object' && value !== null) {
//         fd.append(key, JSON.stringify(value));
//       } else if (value !== null && value !== undefined) {
//         fd.append(key, value);
//       }
//     });

//     const updatedUser = await authAPI.updateProfile("/auth/update-me", fd);
//     const userObj = updatedUser.user || updatedUser.data?.user || updatedUser;

//     updateUser(userObj);
//     setFormData((prev) => ({ 
//       ...prev, 
//       ...userObj,
//       profileImage: userObj.profileImage || prev.profileImage
//     }));
//     setEditMode(false);
//     setAvatarPreview(null);

//     alert("Profile updated successfully!");
//   } catch (err) {
//     console.error("Profile update error:", err);
//     alert(err.message || "Failed to update profile");
//   } finally {
//     setIsSaving(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.email) {
    alert("Name and Email are required");
    return;
  }

  setIsSaving(true);
  try {
    const fd = new FormData();

    // Handle profile image upload if changed
    if (avatarPreview && avatarPreview !== formData.profileImage) {
      if (avatarPreview.startsWith('data:')) {
        const blob = await fetch(avatarPreview).then(r => r.blob());
        fd.append('profileImage', blob, 'profile.jpg');
      }
    }

    // Handle carousel image uploads
    formData.carouselItems?.forEach((item, index) => {
      if (item.imageUrl instanceof File) {
        fd.append('carousel', item.imageUrl); // ← Change to 'carousel'
      }
    });

    // Prepare the data structure
    const preparedData = {
      
      name: formData.name,
      email: formData.email,
      professionalTitle: formData.professionalTitle || '',
      gender: formData.gender || '',
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      phoneNumber: formData.phoneNumber || '',
      alternateEmail: formData.alternateEmail || '',
      bio: formData.bio || '',
      socialMedia: formData.socialMedia || {},
      affiliation: {
        institution: formData.affiliation?.institution || '',
        department: formData.affiliation?.department || '',
        position: formData.affiliation?.position || '',
        faculty: formData.affiliation?.faculty || '',
        joiningDate: formData.affiliation?.joiningDate ? new Date(formData.affiliation.joiningDate).toISOString() : null,
        officeLocation: formData.affiliation?.officeLocation || '',
        officeHours: formData.affiliation?.officeHours || ''
      },
      location: {
        address: formData.location?.address || '',
        city: formData.location?.city || '',
        state: formData.location?.state || '',
        country: formData.location?.country || '',
        postalCode: formData.location?.postalCode || '',
        timeZone: formData.location?.timeZone || ''
      },
      notificationPreferences: {
        emailNotifications: formData.notificationPreferences?.emailNotifications !== false,
        pushNotifications: formData.notificationPreferences?.pushNotifications !== false
      },
      // Handle array fields with proper defaults
      education: formData.education?.map(edu => ({
        degree: edu.degree || '',
        field: edu.field || '',
        institution: edu.institution || '',
        grade: edu.grade || '',
        startdate: edu.startdate || '',
        enddate: edu.enddate || '',
        description: edu.description || ''
      })) || [],
      workExperience: formData.workExperience?.map(exp => ({
        position: exp.position || '',
        organization: exp.organization || '',
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
        current: exp.current || false,
        description: exp.description || ''
      })) || [],
      awards: formData.awards?.map(award => ({
        title: award.title || '',
        year: award.year || '',
        description: award.description || ''
      })) || [],
      researchInterests: formData.researchInterests || [],
      teachingInterests: formData.teachingInterests || [],
      skills: formData.skills || [],
      technicalSkills: formData.technicalSkills?.map(skill => ({
        name: skill.name || '',
        level: skill.level || 'intermediate'
      })) || [],
      languages: formData.languages?.map(lang => ({
        name: lang.name || '',
        proficiency: lang.proficiency || 'professional'
      })) || [],
      hobbies: formData.hobbies || [],
      certificates: formData.certificates?.map(cert => ({
        title: cert.title || '',
        organization: cert.organization || '',
        issueDate: cert.issueDate || '',
        certID: cert.certID || '',
        credentialslink: cert.credentialslink || ''
      })) || [],
      // ... (keep all your existing preparedData code)
      carouselItems: formData.carouselItems?.map(item => ({
        title: item.title || '',
        venue: item.venue || '',
        achievements: item.achievements || '',
        imageUrl: item.imageUrl instanceof File ? '' : item.imageUrl || '', // Handle file case
        isActive: item.isActive !== false,
        order: item.order || 0
      })) || []
    };

    // Append all fields to FormData
    Object.entries(preparedData).forEach(([key, value]) => {
      if (key === 'profileImage') return; // Already handled
      if (typeof value === 'object' && value !== null) {
        fd.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        fd.append(key, value);
      }
    });

    const updatedUser = await authAPI.updateProfile("/auth/update-me", fd);
    const userObj = updatedUser.user || updatedUser.data?.user || updatedUser;

    updateUser(userObj);
    setFormData((prev) => ({ 
      ...prev, 
      ...userObj,
      profileImage: userObj.profileImage || prev.profileImage,
      carouselItems: userObj.carouselItems || prev.carouselItems
    }));
    setEditMode(false);
    setAvatarPreview(null);

    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Profile update error:", err);
    alert(err.message || "Failed to update profile");
  } finally {
    setIsSaving(false);
  }
};


  const validateForm = () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  

  const renderPersonalInfo = () => (
    <div className={styles.sectionContent}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <div className={styles.userAvatarLarge}>
            {user?.profileImage ? (
              <img 
                src={`https://utkarsh-server-807521575693.us-east1.run.app/uploads/Utkarsh-profile.jpg`} 
                alt="Profile" 
                className={styles.avatarImage}
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'A'
            )}
          </div>
          {editMode && (
            <motion.label
              className={styles.avatarEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiCamera size={18} />
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarChange}
              />
            </motion.label>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label><FiUser size={16} /> Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiMail size={16} /> Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Professional Title</label>
        <input
          type="text"
          name="professionalTitle"
          value={formData.professionalTitle}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          disabled={!editMode}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label><FiCalendar size={16} /> Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formatDateForInput(formData.dateOfBirth)}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              dateOfBirth: parseInputDateToISO(e.target.value)
            }));
          }}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiPhone size={16} /> Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiMail size={16} /> Alternate Email</label>
        <input
          type="email"
          name="alternateEmail"
          value={formData.alternateEmail}
          onChange={handleInputChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows="3"
          disabled={!editMode}
        />
      </div>
    </div>
  );

  const renderAffiliation = () => (
    <div className={styles.sectionContent}>
      <div className={styles.formGroup}>
        <label><FiHome size={16} /> Institution</label>
        <input
          type="text"
          name="institution"
          value={formData.affiliation.institution}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Department</label>
        <input
          type="text"
          name="department"
          value={formData.affiliation.department}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Position</label>
        <input
          type="text"
          name="position"
          value={formData.affiliation.position}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Faculty</label>
        <input
          type="text"
          name="faculty"
          value={formData.affiliation.faculty}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiCalendar size={16} /> Joining Date</label>
        {/* // For joiningDate in affiliation */}
          <input
            type="date"
            name="joiningDate"
            value={formatDateForInput(formData.affiliation.joiningDate)}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                affiliation: {
                  ...prev.affiliation,
                  joiningDate: parseInputDateToISO(e.target.value)
                }
              }));
            }}
            disabled={!editMode}
          />
      </div>

      <div className={styles.formGroup}>
        <label>Office Location</label>
        <input
          type="text"
          name="officeLocation"
          value={formData.affiliation.officeLocation}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiClock size={16} /> Office Hours</label>
        <input
          type="text"
          name="officeHours"
          value={formData.affiliation.officeHours}
          onChange={handleAffiliationChange}
          disabled={!editMode}
        />
      </div>
    </div>
  );
const renderCarouselSettings = () => (
  <div className={styles.sectionContent}>
    <div className={styles.sectionHeader}>
      <h3 className={styles.sectionTitle}>Carousel Management</h3>
      <p className={styles.sectionSubtitle}>Manage your professional engagements showcase</p>
    </div>
    
    <div className={styles.carouselItemsContainer}>
      {formData.carouselItems.map((item, index) => (
        <div key={index} className={`${styles.carouselItem} ${!item.isActive ? styles.inactive : ''}`}>
          <div className={styles.itemHeader}>
            <span className={styles.itemBadge}>Item #{index + 1}</span>
            <div className={styles.itemControls}>
              <button 
                onClick={() => moveCarouselItem(index, 'up')} 
                disabled={index === 0}
                className={styles.controlButton}
                aria-label="Move up"
              >
                <FiChevronUp />
              </button>
              <button 
                onClick={() => moveCarouselItem(index, 'down')} 
                disabled={index === formData.carouselItems.length - 1}
                className={styles.controlButton}
                aria-label="Move down"
              >
                <FiChevronDown />
              </button>
              <button 
                onClick={() => toggleCarouselItemActive(index)}
                className={`${styles.toggleButton} ${item.isActive ? styles.active : ''}`}
                aria-label={item.isActive ? "Deactivate item" : "Activate item"}
              >
                {item.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                <span>{item.isActive ? 'Active' : 'Inactive'}</span>
              </button>
              <button 
                onClick={() => removeCarouselItem(index)}
                className={styles.deleteButton}
                aria-label="Delete item"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          <div className={styles.itemContent}>
            <div className={styles.imageUpload}>
              <div className={styles.uploadArea}>
                {item.imageUrl || item.imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img 
                      className={styles.previewImage}
                      src={
                        item.imagePreview || 
                        (item.imageUrl instanceof File ? URL.createObjectURL(item.imageUrl) : 
                        item.imageUrl.startsWith('http') ? item.imageUrl : 
                        `https://utkarsh-server-807521575693.us-east1.run.app${item.imageUrl}`)
                      } 
                      alt="Preview" 
                    />
                    <div className={styles.imageOverlay}>
                      <FiUpload size={20} />
                      <span>Replace Image</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <FiUpload size={24} />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCarouselItemChange(index, 'imageUrl', e.target.files[0]);
                    }
                  }}
                  className={styles.fileInput}
                />
              </div>
              <p className={styles.imageHint}>Recommended: 1200×600px (2:1 ratio)</p>
            </div>

            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title*</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleCarouselItemChange(index, 'title', e.target.value)}
                  placeholder="e.g., International Conference Speaker"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Venue</label>
                <input
                  type="text"
                  value={item.venue}
                  onChange={(e) => handleCarouselItemChange(index, 'venue', e.target.value)}
                  placeholder="e.g., New York, USA"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Achievements</label>
                <textarea
                  value={item.achievements}
                  onChange={(e) => handleCarouselItemChange(index, 'achievements', e.target.value)}
                  placeholder="Key achievements or takeaways..."
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button 
      type="button" 
      onClick={addCarouselItem} 
      className={styles.addButton}
    >
      <FiPlus /> Add New Engagement
    </button>
  </div>
);



  const renderLocation = () => (
    <div className={styles.sectionContent}>
      <div className={styles.formGroup}>
        <label><FiMapPin size={16} /> Address</label>
        <input
          type="text"
          name="address"
          value={formData.location.address}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.location.city}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>State/Province</label>
        <input
          type="text"
          name="state"
          value={formData.location.state}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Country</label>
        <input
          type="text"
          name="country"
          value={formData.location.country}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Postal Code</label>
        <input
          type="text"
          name="postalCode"
          value={formData.location.postalCode}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Time Zone</label>
        <input
          type="text"
          name="timeZone"
          value={formData.location.timeZone}
          onChange={handleLocationChange}
          disabled={!editMode}
        />
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className={styles.sectionContent}>
      {formData.education.map((edu, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeEducation(index)}
            >
              ×
            </button>
          )}
          <h4>{edu.degree} in {edu.field}</h4>
          <p className={styles.institution}>{edu.institution}</p>
          <p className={styles.dates}>
            {edu.startdate} - {edu.enddate || 'Present'} | Grade: {edu.grade}
          </p>
          {edu.description && <p className={styles.description}>{edu.description}</p>}
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Education</h4>
          <div className={styles.formGroup}>
            <label>Degree</label>
            <input
              type="text"
              name="degree"
              value={newEducation.degree}
              onChange={handleEducationChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Field of Study</label>
            <input
              type="text"
              name="field"
              value={newEducation.field}
              onChange={handleEducationChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Institution</label>
            <input
              type="text"
              name="institution"
              value={newEducation.institution}
              onChange={handleEducationChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Grade</label>
            <input
              type="text"
              name="grade"
              value={newEducation.grade}
              onChange={handleEducationChange}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                name="startdate"
                value={newEducation.startdate}
                onChange={handleEducationChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                name="enddate"
                value={newEducation.enddate}
                onChange={handleEducationChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={newEducation.description}
              onChange={handleEducationChange}
              rows="2"
            />
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addEducation}
            disabled={!newEducation.degree || !newEducation.institution}
          >
            Add Education
          </button>
        </div>
      )}
    </div>
  );

  const renderCrashCourses = () => (
    <div className={styles.sectionContent}>
      {formData.crashcourses.map((course, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeCrashCourse(index)}
            >
              ×
            </button>
          )}
          <h4>{course.course}</h4>
          <p className={styles.field}>{course.field}</p>
          <p className={styles.organization}>Organization: {course.organization}</p>
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Crash Course</h4>
          <div className={styles.formGroup}>
            <label>Course Name</label>
            <input
              type="text"
              name="course"
              value={newCrashCourse.course}
              onChange={handleCrashCourseChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Field</label>
            <input
              type="text"
              name="field"
              value={newCrashCourse.field}
              onChange={handleCrashCourseChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={newCrashCourse.organization}
              onChange={handleCrashCourseChange}
            />
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addCrashCourse}
            disabled={!newCrashCourse.course || !newCrashCourse.organization}
          >
            Add Crash Course
          </button>
        </div>
      )}
    </div>
  );

  const renderWorkExperience = () => (
    <div className={styles.sectionContent}>
      {formData.workExperience.map((exp, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeWorkExperience(index)}
            >
              ×
            </button>
          )}
          <h4>{exp.position}</h4>
          <p className={styles.organization}>{exp.organization}</p>
          <p className={styles.dates}>
            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
          </p>
          {exp.description && <p className={styles.description}>{exp.description}</p>}
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Work Experience</h4>
          <div className={styles.formGroup}>
            <label>Position</label>
            <input
              type="text"
              name="position"
              value={newWorkExperience.position}
              onChange={handleWorkExperienceChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={newWorkExperience.organization}
              onChange={handleWorkExperienceChange}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={newWorkExperience.startDate}
                onChange={handleWorkExperienceChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={newWorkExperience.endDate}
                onChange={handleWorkExperienceChange}
                disabled={newWorkExperience.current}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                name="current"
                checked={newWorkExperience.current}
                onChange={handleWorkExperienceChange}
              />
              I currently work here
            </label>
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={newWorkExperience.description}
              onChange={handleWorkExperienceChange}
              rows="3"
            />
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addWorkExperience}
            disabled={!newWorkExperience.position || !newWorkExperience.organization}
          >
            Add Experience
          </button>
        </div>
      )}
    </div>
  );

  const renderAwards = () => (
    <div className={styles.sectionContent}>
      {formData.awards.map((award, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeAward(index)}
            >
              ×
            </button>
          )}
          <h4>{award.title}</h4>
          <p className={styles.year}>Year: {award.year}</p>
          {award.description && <p className={styles.description}>{award.description}</p>}
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Award</h4>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={newAward.title}
              onChange={handleAwardChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={newAward.year}
              onChange={handleAwardChange}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={newAward.description}
              onChange={handleAwardChange}
              rows="2"
            />
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addAward}
            disabled={!newAward.title || !newAward.year}
          >
            Add Award
          </button>
        </div>
      )}
    </div>
  );

  const renderResearchInterests = () => (
    <div className={styles.sectionContent}>
      <div className={styles.skillsSection}>
        <h4>Research Interests</h4>
        <div className={styles.skillsContainer}>
          {formData.researchInterests.map((interest, index) => (
            <div key={index} className={styles.skillTag}>
              {interest}
              {editMode && (
                <button 
                  className={styles.removeTagButton}
                  onClick={() => removeResearchInterest(interest)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {editMode && (
          <div className={styles.addSkill}>
            <input
              type="text"
              value={newResearchInterest}
              onChange={(e) => setNewResearchInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
              placeholder="Add research interest and press Enter"
            />
            <button 
              type="button" 
              className={styles.addButtonSmall}
              onClick={addResearchInterest}
              disabled={!newResearchInterest.trim()}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeachingInterests = () => (
    <div className={styles.sectionContent}>
      <div className={styles.skillsSection}>
        <h4>Teaching Interests</h4>
        <div className={styles.skillsContainer}>
          {formData.teachingInterests.map((interest, index) => (
            <div key={index} className={styles.skillTag}>
              {interest}
              {editMode && (
                <button 
                  className={styles.removeTagButton}
                  onClick={() => removeTeachingInterest(interest)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {editMode && (
          <div className={styles.addSkill}>
            <input
              type="text"
              value={newTeachingInterest}
              onChange={(e) => setNewTeachingInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTeachingInterest()}
              placeholder="Add teaching interest and press Enter"
            />
            <button 
              type="button" 
              className={styles.addButtonSmall}
              onClick={addTeachingInterest}
              disabled={!newTeachingInterest.trim()}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className={styles.sectionContent}>
      <div className={styles.skillsSection}>
        <h4>General Skills</h4>
        <div className={styles.skillsContainer}>
          {formData.skills.map((skill, index) => (
            <div key={index} className={styles.skillTag}>
              {skill}
              {editMode && (
                <button 
                  className={styles.removeTagButton}
                  onClick={() => removeSkill(skill)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {editMode && (
          <div className={styles.addSkill}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add skill and press Enter"
            />
            <button 
              type="button" 
              className={styles.addButtonSmall}
              onClick={addSkill}
              disabled={!newSkill.trim()}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTechnicalSkills = () => (
    <div className={styles.sectionContent}>
      {formData.technicalSkills.map((skill, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeTechnicalSkill(index)}
            >
              ×
            </button>
          )}
          <h4>{skill.name}</h4>
          <p>Level: {skill.level}</p>
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Technical Skill</h4>
          <div className={styles.formGroup}>
            <label>Skill Name</label>
            <input
              type="text"
              name="name"
              value={newTechnicalSkill.name}
              onChange={handleTechnicalSkillChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Proficiency Level</label>
            <select
              name="level"
              value={newTechnicalSkill.level}
              onChange={handleTechnicalSkillChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addTechnicalSkill}
            disabled={!newTechnicalSkill.name}
          >
            Add Technical Skill
          </button>
        </div>
      )}
    </div>
  );

  const renderLanguages = () => (
    <div className={styles.sectionContent}>
      {formData.languages.map((lang, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeLanguage(index)}
            >
              ×
            </button>
          )}
          <h4>{lang.name}</h4>
          <p>Proficiency: {lang.proficiency}</p>
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Language</h4>
          <div className={styles.formGroup}>
            <label>Language</label>
            <input
              type="text"
              name="name"
              value={newLanguage.name}
              onChange={handleLanguageChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Proficiency</label>
            <select
              name="proficiency"
              value={newLanguage.proficiency}
              onChange={handleLanguageChange}
            >
              <option value="basic">Basic</option>
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="fluent">Fluent</option>
              <option value="native">Native</option>
            </select>
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addLanguage}
            disabled={!newLanguage.name}
          >
            Add Language
          </button>
        </div>
      )}
    </div>
  );

  const renderHobbies = () => (
    <div className={styles.sectionContent}>
      <div className={styles.skillsSection}>
        <h4>Hobbies & Interests</h4>
        <div className={styles.skillsContainer}>
          {formData.hobbies.map((hobby, index) => (
            <div key={index} className={styles.skillTag}>
              {hobby}
              {editMode && (
                <button 
                  className={styles.removeTagButton}
                  onClick={() => removeHobby(hobby)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {editMode && (
          <div className={styles.addSkill}>
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHobby()}
              placeholder="Add hobby and press Enter"
            />
            <button 
              type="button" 
              className={styles.addButtonSmall}
              onClick={addHobby}
              disabled={!newHobby.trim()}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className={styles.sectionContent}>
      {formData.certificates.map((cert, index) => (
        <div key={index} className={styles.itemCard}>
          {editMode && (
            <button 
              className={styles.removeButton}
              onClick={() => removeCertificate(index)}
            >
              ×
            </button>
          )}
          <h4>{cert.title}</h4>
          <p className={styles.organization}>Issued by: {cert.organization}</p>
          <p className={styles.date}>Issue Date: {cert.issueDate}</p>
          {cert.certID && <p className={styles.credential}>Credential ID: {cert.certID}</p>}
          {cert.credentialslink && (
            <a href={cert.credentialslink} target="_blank" rel="noopener noreferrer">
              View Credential
            </a>
          )}
        </div>
      ))}

      {editMode && (
        <div className={styles.addForm}>
          <h4>Add Certificate</h4>
          <div className={styles.formGroup}>
            <label>Certificate Title</label>
            <input
              type="text"
              name="title"
              value={newCertificate.title}
              onChange={handleCertificateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={newCertificate.organization}
              onChange={handleCertificateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={newCertificate.issueDate}
              onChange={handleCertificateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Credential ID (optional)</label>
            <input
              type="text"
              name="certID"
              value={newCertificate.certID}
              onChange={handleCertificateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Credentials Link (optional)</label>
            <input
              type="url"
              name="credentialslink"
              value={newCertificate.credentialslink}
              onChange={handleCertificateChange}
              placeholder="https://example.com/certificate"
            />
          </div>
          <button 
            type="button" 
            className={styles.addButton}
            onClick={addCertificate}
            disabled={!newCertificate.title || !newCertificate.organization}
          >
            Add Certificate
          </button>
        </div>
      )}
    </div>
  );

  const renderSocialMedia = () => (
    <div className={styles.sectionContent}>
      <div className={styles.formGroup}>
        <label><FiTwitter size={16} /> Twitter</label>
        <input
          type="url"
          name="twitter"
          value={formData.socialMedia.twitter}
          onChange={handleSocialMediaChange}
          placeholder="https://twitter.com/username"
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiLinkedin size={16} /> LinkedIn</label>
        <input
          type="url"
          name="linkedin"
          value={formData.socialMedia.linkedin}
          onChange={handleSocialMediaChange}
          placeholder="https://linkedin.com/in/username"
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label><FiGithub size={16} /> GitHub</label>
        <input
          type="url"
          name="github"
          value={formData.socialMedia.github}
          onChange={handleSocialMediaChange}
          placeholder="https://github.com/username"
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>ResearchGate</label>
        <input
          type="url"
          name="researchGate"
          value={formData.socialMedia.researchGate}
          onChange={handleSocialMediaChange}
          placeholder="https://www.researchgate.net/profile/username"
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Google Scholar</label>
        <input
          type="url"
          name="googleScholar"
          value={formData.socialMedia.googleScholar}
          onChange={handleSocialMediaChange}
          placeholder="https://scholar.google.com/citations?user=ID"
          disabled={!editMode}
        />
      </div>

      <div className={styles.formGroup}>
        <label>ORCID</label>
        <input
          type="text"
          name="ORCID"
          value={formData.socialMedia.ORCID}
          onChange={handleSocialMediaChange}
          placeholder="0000-0000-0000-0000"
          disabled={!editMode}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className={styles.sectionContent}>
      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={formData.notificationPreferences.emailNotifications}
            onChange={handleNotificationPrefChange}
            disabled={!editMode}
          />
          Email Notifications
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            name="pushNotifications"
            checked={formData.notificationPreferences.pushNotifications}
            onChange={handleNotificationPrefChange}
            disabled={!editMode}
          />
          Push Notifications
        </label>
      </div>
    </div>
  );

  return (
    // <div className={`${styles.tabContent} ${darkMode ? styles.dark : ''}`}>
    //   <motion.div 
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.3 }}
    //     className={styles.profileContainer}
    //   >
    //     <div className={styles.profileHeader}>
    //       <h2>Profile Settings</h2>
    //       {!editMode ? (
    //         <motion.button
    //           className={`${styles.editButton} ${darkMode ? styles.dark : ''}`}
    //           onClick={() => setEditMode(true)}
    //           whileHover={{ scale: 1.03 }}
    //           whileTap={{ scale: 0.98 }}
    //         >
    //           <FiEdit size={16} /> Edit Profile
    //         </motion.button>
    //       ) : (
    //         <div className={styles.editActions}>
    //           <motion.button
    //             className={`${styles.cancelButton} ${darkMode ? styles.dark : ''}`}
    //             onClick={() => {
    //               setEditMode(false);
    //               setAvatarPreview(null);
    //             }}
    //             whileHover={{ scale: 1.03 }}
    //             whileTap={{ scale: 0.98 }}
    //           >
    //             Cancel
    //           </motion.button>
    //           <motion.button
    //             className={`${styles.saveButton} ${darkMode ? styles.dark : ''}`}
    //             onClick={handleSubmit}
    //             whileHover={{ scale: 1.03 }}
    //             whileTap={{ scale: 0.98 }}
    //           >
    //             <FiSave size={16} /> Save Changes
    //           </motion.button>
    //         </div>
    //       )}
    //     </div>
    <div className={`${styles.tabContent} ${darkMode ? styles.dark : ''}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.profileContainer}
      >
        <div className={styles.profileHeader}>
          <h2>Profile Settings</h2>
          {!editMode ? (
            <motion.button
              className={`${styles.editButton} ${darkMode ? styles.dark : ''}`}
              onClick={() => setEditMode(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiEdit size={16} /> Edit Profile
            </motion.button>
          ) : (
            <div className={styles.editActions}>
              <motion.button
                className={`${styles.cancelButton} ${darkMode ? styles.dark : ''}`}
                onClick={() => {
                  setEditMode(false);
                  setAvatarPreview(null);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className={`${styles.saveButton} ${darkMode ? styles.dark : ''}`}
                onClick={handleSubmit}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSaving}
              >
                <FiSave size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading profile data...</p>
          </div>
        ) : (
          <>
        <div className={styles.settingsNav}>
          <button
            className={`${styles.navButton} ${activeSection === 'personal' ? styles.active : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            Personal Info
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'carousel' ? styles.active : ''}`}
            onClick={() => setActiveSection('carousel')}
          >
            Homepage Carousel
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'affiliation' ? styles.active : ''}`}
            onClick={() => setActiveSection('affiliation')}
          >
            Affiliation
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'location' ? styles.active : ''}`}
            onClick={() => setActiveSection('location')}
          >
            Location
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'education' ? styles.active : ''}`}
            onClick={() => setActiveSection('education')}
          >
            Education
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'crashcourses' ? styles.active : ''}`}
            onClick={() => setActiveSection('crashcourses')}
          >
            Crash Courses
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'workExperience' ? styles.active : ''}`}
            onClick={() => setActiveSection('workExperience')}
          >
            Work Experience
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'awards' ? styles.active : ''}`}
            onClick={() => setActiveSection('awards')}
          >
            Awards
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'researchInterests' ? styles.active : ''}`}
            onClick={() => setActiveSection('researchInterests')}
          >
            Research Interests
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'teachingInterests' ? styles.active : ''}`}
            onClick={() => setActiveSection('teachingInterests')}
          >
            Teaching Interests
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'skills' ? styles.active : ''}`}
            onClick={() => setActiveSection('skills')}
          >
            Skills
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'technicalSkills' ? styles.active : ''}`}
            onClick={() => setActiveSection('technicalSkills')}
          >
            Technical Skills
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'languages' ? styles.active : ''}`}
            onClick={() => setActiveSection('languages')}
          >
            Languages
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'hobbies' ? styles.active : ''}`}
            onClick={() => setActiveSection('hobbies')}
          >
            Hobbies
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'certificates' ? styles.active : ''}`}
            onClick={() => setActiveSection('certificates')}
          >
            Certificates
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'socialMedia' ? styles.active : ''}`}
            onClick={() => setActiveSection('socialMedia')}
          >
            Social Media
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'notifications' ? styles.active : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            Notifications
          </button>
        </div>

        <div className={styles.settingsContent}>
          {activeSection === 'personal' && renderPersonalInfo()}
          {activeSection === 'carousel' && renderCarouselSettings()}
          {activeSection === 'affiliation' && renderAffiliation()}
          {activeSection === 'location' && renderLocation()}
          {activeSection === 'education' && renderEducation()}
          {activeSection === 'crashcourses' && renderCrashCourses()}
          {activeSection === 'workExperience' && renderWorkExperience()}
          {activeSection === 'awards' && renderAwards()}
          {activeSection === 'researchInterests' && renderResearchInterests()}
          {activeSection === 'teachingInterests' && renderTeachingInterests()}
          {activeSection === 'skills' && renderSkills()}
          {activeSection === 'technicalSkills' && renderTechnicalSkills()}
          {activeSection === 'languages' && renderLanguages()}
          {activeSection === 'hobbies' && renderHobbies()}
          {activeSection === 'certificates' && renderCertificates()}
          {activeSection === 'socialMedia' && renderSocialMedia()}
          {activeSection === 'notifications' && renderNotificationSettings()}
        </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileSettings;


