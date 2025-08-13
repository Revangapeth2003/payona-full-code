import React, { useState, useEffect } from 'react';
import './HelpCommunity.css';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6';
import { FaYoutube } from 'react-icons/fa';

const bannerImages = [
  "insta-11.jpg",
  "cahnge21.jpg",
  "insta-12.jpg",
  
  "cahnge22.jpg",
];

const HelpCommunity = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    occupation: '',
    education: '',
    experience: '',
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (step === 1 && formData.occupation) setStep(2);
    else if (step === 2 && formData.education) setStep(3);
    else if (step === 3 && formData.experience) setStep(4);
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (10 digits)';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://13.201.58.112:5000/submit-work-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        setStep(5);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  return (
    <div className="help-community-container">
      <div className="banner-slideshow">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`banner-slide ${index === currentBanner ? 'active' : ''}`}
          >
            <img src={image} alt={`Banner ${index + 1}`} />
          </div>
        ))}
        
        <div className="banner-dots">
          {bannerImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>
        
        {/* Carousel Navigation Buttons */}
        <div 
          className="carousel-nav carousel-prev" 
          onClick={() => setCurrentBanner((currentBanner - 1 + bannerImages.length) % bannerImages.length)}
        >
          &#10094;
        </div>
        <div 
          className="carousel-nav carousel-next" 
          onClick={() => setCurrentBanner((currentBanner + 1) % bannerImages.length)}
        >
          &#10095;
        </div>
      </div>

      <div className="content-container">
        <div className="left-panel">
          <h1 className='worky'>WORK PROFILE ASSESSMENT</h1>
          {step === 1 && (
            <div>
              <h1 className="left-heading">Your occupation</h1>
              <div className="button-grid">
                {['IT', 'Skilled Worker', 'Medicine', 'Administration'].map((occ) => (
                  <button
                    key={occ}
                    className={`square-btn ${formData.occupation === occ ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, occupation: occ })}
                  >
                    {occ}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other occupation"
                className="input-field"
                value={formData.occupation}
                onChange={handleChange}
                name="occupation"
              />
              <button className="full-btn" onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="left-heading">Your education</h1>
              <div className="button-grid">
                {['Masters', 'Graduate', 'PhD'].map((edu) => (
                  <button
                    key={edu}
                    className={`square-btn ${formData.education === edu ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, education: edu })}
                  >
                    {edu}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other education"
                className="input-field"
                value={formData.education}
                onChange={handleChange}
                name="education"
              />
              <button className="full-btn" onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="left-heading">Select Experience</h1>
              <div className="button-grid">
                {['Fresher', '1-2 years', '2-4 years', '4+ years'].map((experience) => (
                  <button
                    key={experience}
                    className={`square-btn ${formData.experience === experience ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, experience })}
                  >
                    {experience}
                  </button>
                ))}
              </div>
              <button className="full-btn" onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="left-heading">You may be qualified for a job please contact us.</h1>
              <div className="form-group">
                
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  className="input-field"
                />
                {formErrors.name && <p className="error-message">{formErrors.name}</p>}
              </div>

              <div className="form-group">
                
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  className="input-field"
                />
                {formErrors.email && <p className="error-message">{formErrors.email}</p>}
              </div>

              <div className="form-group">
                 
                <input
                  type="number"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  name="phone"
                  className="input-field"
                />
                {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
              </div>

              <button
                type="button"
                className="full-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
            
          )}

          {step === 5 && (
            <div>
              <h1 className="left-heading">Congratulations!</h1>
              <p>You may be qualified for a job; please contact us.</p>
              <button className="full-btn" onClick={() => setShowPopup(true)}>
                Learn More
              </button>
            </div>
          )}
        </div>

        <div className="right-panel">
          <h2 className="right-heading">Join Our Community</h2>
          <p className="subtext">
            Connect with students, alumni, and experts via WhatsApp.
          </p>

          <a
            href="https://chat.whatsapp.com/EZosWS932Td9rkdB9HQrlk"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
            <FaWhatsapp size={20} />
            <span>Join WhatsApp App</span>
          </a>

          <div className="social-iconss">
            <a href="https://www.instagram.com/payanaoverseassolutions/" className="social-icon instagram">
              <FaInstagram size={20} />
            </a>
            <a href="https://www.facebook.com/payanaOverseas?locale=hu_HU" className="social-icon facebook">
              <FaFacebookF size={20} />
            </a>
            <a href="https://x.com/PayanaOverseas" className="social-icon twitter">
              <FaXTwitter size={20} />
            </a>
            <a href="https://www.youtube.com/channel/UCwhgSMTSMig0sbgN_0mbyHg" className="social-icon twitter">
              <FaYoutube size={20} />
            </a>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            
            <h2>Your Details</h2>
            <p><strong>Occupation:</strong> {formData.occupation}</p>
            <p><strong>Education:</strong> {formData.education}</p>
            <p><strong>Experience:</strong> {formData.experience}</p>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <button
              className="close-btn"
              onClick={() => setShowPopup(false)}
            >
              close
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default HelpCommunity;