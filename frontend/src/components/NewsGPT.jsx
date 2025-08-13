import React from 'react';
import './NewsGPT.css';
import { FaCheckCircle } from 'react-icons/fa';
const NewsGPT = () => {
  return (
    <section className="news-gpt-container">
      <div className="news-left">
        <h1><span className="bold">Trending</span> News</h1>
        <div className="news-cards-wrapper">
          <div className="news-card">
            <img src="13.png" alt="News" className="news-image" />
            <div className="news-date-time">
              <span>March 15, 2024</span>
              <span>10:30 AM</span>
            </div>
            <div className="news-content">
              <p className="news-description">
                As more families relocate overseas for work, education, or lifestyle changes, the challenges of parenting abroad are coming into sharper focus.
              </p>
              <p className="news-description">
                Recent studies show that international families face unique educational hurdles, including curriculum differences, language barriers, and cultural adaptation for children.
              </p>
              <p className="news-description ">
              </p>
              <span className="news-tag">Canada</span>
            </div>
          </div>
          <div className="news-card">
            <img src="9.png" alt="News" className="news-image" />
            <div className="news-date-time">
              <span>April 01, 2024</span>
              <span>11:00 AM</span>
            </div>
            <div className="news-content">
              <p className="news-description">
                Universities across Europe see a rise in Indian students enrolling in AI and tech-related courses in 2024.
              </p>
              <p className="news-description">
                The trend reflects growing interest in European education systems that offer practical training, research opportunities, and favorable post-study work permits.
              </p>
              <p className="news-description">
                Courses in artificial intelligence, data science, and cybersecurity are particularly popular, with many programs offering direct industry connections and internship opportunities.
              </p>
              <p className="news-tag">Germany</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="news-right">
        <div className="about-payana">
          
          <div className="payanatop">
          <h1>Why Payana Overseas?</h1>
          </div>

         
          <div className="responsehold1">
            <div className="holeone">
            <div className="stats-container">
          <div className="stat-item">20+ COUNTRIES</div>
          <div className="stat-item">700+ UNIVERSITIES</div>
        </div>
        
        <ul className="features-list">
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Licensed consultant
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Direct counseling with experts
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Work while you study
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Post study work permit
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Accommodation guidance
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Certified trainers (IELTS, TOEFL,PTE)
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            Foreign language trainings
          </li>
        </ul>
            </div>
            <div className="holetwo" >
                <img src='realwatwe.svg'></img>
            </div>
          </div> 
             <div className="responsehold">
              <div className="responsedivide reddy">
                <h2>Mission</h2>
              <p className="about-paragraph">
              Striving to work closely with our clients to provide the best solution for their higher education, work and other immigration objectives by providing an integrated solution approach.
              </p>
              </div>
              <div className="responsedivide grenny">
              <h2>Vison</h2>
              <p className="about-paragraph">
              To make sure overseas education and overseas work options are highly reachable and affordable to every qualified individual irrespective of their financial status.
              </p>
              </div>
          </div> 
        </div>
      </div>
    </section>
  );
};

export default NewsGPT;