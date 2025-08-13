import React, { useState } from 'react';
import './BannerSection.css';

const BannerSection = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="banner-container">
      <div className="banner-left">
        {!isImageLoaded && (
          <div className="image-loader">
            <div className="spinner"></div>
          </div>
        )}
        <img
          src="bannerjay.jpg"
          className={`bannerimg ${isImageLoaded ? 'visible' : 'hidden'}`}
          alt="Banner Image"
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <div className="banner-right">
        <h2 className="banner-heading">What are you looking for?</h2>

        <div className="buttons-grid">
          <button className="category-btn" onClick={() => scrollToSection('study')}>STUDY Tech</button>
          <button className="category-btn" onClick={() => scrollToSection('mbbs')}>STUDY MBBS</button>
          <button className="category-btn" onClick={() => scrollToSection('study')}>STUDY ARTS</button>
          <button className="category-btn" onClick={() => scrollToSection('language')}>Language</button>
          <button className="category-btn" onClick={() => scrollToSection('invest')}>Invest</button>
          <button className="category-btn" onClick={() => scrollToSection('work')}>Work</button>
        </div>

        <div className="contact-infoi">
          <p>For free counseling contact us:</p>
          <a href="tel:+919003619777" className="contact-phone">+91 90036 19777</a>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
