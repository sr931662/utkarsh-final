import React from 'react'
import styles from './Home.module.css'
import Hero from './Hero/Hero'
import ResearchInterest from './ResearchInterests/ResearchInterests'
import Publications from './Publications/Publications'
import CV from './CV/CV'
import Contact from './Contacts/Contact'
import Carousel from './Carousel/Carousel'
import { Helmet } from 'react-helmet'

// import { getImageUrl } from '../../utils'

function Home() {
  return (
    <div className={styles.home1}>
      <Helmet>
        <title>Home - Mr. Utkarsh Gupta Portfolio</title>
        <link rel="canonical" href="https://utkarshgupta.info/" />
      </Helmet>
      <Hero />
      <ResearchInterest />
      <Publications />
      <CV />
      <Contact />
    </div>
  )
}

export default Home
