import React, { useState, useEffect } from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import './Navbartop.css';

const Navbartop = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 820);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 820);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleHoverEffect = (category, isEnter) => {
            const bannerBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
            if (bannerBtn) {
                bannerBtn.classList.toggle('hover-pulse', isEnter);
            }
        };
        if (activeCategory) {
            handleHoverEffect(activeCategory, true);
            return () => handleHoverEffect(activeCategory, false);
        }
    }, [activeCategory]);

    const handleClickScroll = (category) => {
        const section = document.getElementById(category);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className='navbartop'>
            <div className='logo-section'>
                <img 
                    // src={isMobileView ? "payanalogopng.png" : "final 5.png"} 
                    src="new.png"
                    alt="Logo"
                />
            </div>
            <div className="redlogo"></div>
            <div className="coloumintop">
                <ul className='contact-info'>
                    <li>
                        <FaPhone className="icon" size={18} />
                        <span>+91 90036 19777</span>
                    </li>
                    <li>
                        <FaWhatsapp className="icon" size={20} />
                        <span>+91 90039 46446</span>
                    </li>
                    <li>
                        <FaEnvelope className="icon" size={20} />
                        <span>Study@payanaoverseas.com</span>
                    </li>
                </ul>
                <div className={`contact-nav ${isMobileMenuOpen ? 'show' : ''}`}>
                    <ul className='nav-links'>
                        {['study', 'mbbs', 'study', 'language', 'invest', 'work'].map((category, index) => (
                            
                            <li
                                key={category}
                                data-category={category}
                                onMouseEnter={() => setActiveCategory(category)}
                                onMouseLeave={() => setActiveCategory(null)}
                                onClick={() => handleClickScroll(category)}
                                className={activeCategory === category ? 'active' : ''}
                            >
                                {['Study Tech', 'Study MBBS', 'Study Arts ', 'Language', 'Invest', 'Work'][index]}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbartop;