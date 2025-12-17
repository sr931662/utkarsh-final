import './App.css';
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import Hero from './components/Home/Hero/Hero';
import ResearchInterest from './components/Home/ResearchInterests/ResearchInterests';
import Publications from './components/Home/Publications/Publications';
import Carousel from './components/Home/Carousel/Carousel';
import CV from './components/Home/CV/CV';
import Contact from './components/Home/Contacts/Contact';

import PublicationsDetail from './components/Home/Publications/publications_detail/Publications_detail';
import Login from './components/Login/Login';
import Dashboard from './components/dashboard/dashboard';
import Admin from './components/admin/admin';
import ProfileSettings from './components/dashboard/profileSettings/profileSettings';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './context/protectedRoute';
import { authAPI } from './context/authAPI';

/* =========================
   BACKGROUND BLOBS LAYOUT
========================= */
const BackgroundBlobs = () => (
  <div className="background-blobs">
    <div className="blob one"></div>
    <div className="blob two"></div>
    <div className="blob three"></div>
  </div>
);

const HomePage = ({ carouselData }) => (
  <>
    <Hero />
    <ResearchInterest />
    <Publications />
    <Carousel carouselItems={carouselData} />
    <CV />
    <Contact />
  </>
);

const App = () => {
  const [carouselData, setCarouselData] = useState([]);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const res = await authAPI.getPublicSuperadmin();
        if (res.data?.user?.carouselItems) {
          setCarouselData(res.data.user.carouselItems);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCarousel();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>

          <BackgroundBlobs />
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage carouselData={carouselData} />} />
            <Route path="/publications/:id" element={<PublicationsDetail />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route
                path="/admin/profile"
                element={<ProfileSettings carouselData={carouselData} />}
              />
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>

          <Footer />

        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
