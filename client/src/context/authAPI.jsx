import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://utkarsh-server-807521575693.us-east1.run.app/api',
  baseURL: 'https://utkarsh-server-807521575693.us-east1.run.app/api',
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use((config) => {
  const authData = JSON.parse(localStorage.getItem('auth'));
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await api.post('/auth/refresh');
        const authData = {
          token: data.token,
          expiry: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  getMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      return {
        success: true,
        user: data.user || data.data?.user || data,
        token: data.token
      };
    } catch (error) {
      console.error('GetMe error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  },
  // client/src/context/authAPI.jsx - Update the sendContactEmail method
sendContactEmail: async (formData) => {
  try {
    const { data } = await api.post('/contact/send-contact-email', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });
    
    return { 
      success: true, 
      data,
      message: data.message || 'Message sent successfully!'
    };
  } catch (error) {
    console.error('Contact email failed:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to send message. Please try again later.';
    
    throw new Error(errorMessage);
  }
},


  getPublicContactInfo: async () => {
    try {
      const { data } = await api.get('/auth/public/contact');
      return {
        success: true,
        data: data.data?.user || data.user || data
      };
    } catch (error) {
      console.error('Failed to fetch contact information:', error);
      throw error;
    }
  },
  getPublicSuperadmin: async () => {
    try {
      const { data } = await api.get('/auth/public/superadmin');
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
      throw error;
    }
  },

  // Add these methods to your authAPI object in authAPI.js

  getPublicCarousel: async () => {
    try {
      const { data } = await api.get('/auth/public/carousel');
      return {
        success: true,
        data: data.data?.carouselItems || data.carouselItems || []
      };
    } catch (error) {
      console.error('Failed to fetch carousel data:', error);
      throw error;
    }
  },

  updateCarousel: async (carouselItems) => {
    try {
      const { data } = await api.patch('/auth/update-carousel', { carouselItems });
      return {
        success: true,
        data: data.data?.user || data.user || data
      };
    } catch (error) {
      console.error('Failed to update carousel:', error);
      throw error;
    }
  },
  // Update the updateProfile method in authAPI.js
  updateProfile: async (url, formData) => {
    try {
      const response = await api.patch(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update failed:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  },
  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  }
};

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default api;



