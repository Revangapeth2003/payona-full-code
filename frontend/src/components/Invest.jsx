import React, { useState } from 'react';
import './invest.css';

const Invest = () => {
  const [submissions, setSubmissions] = useState({
    canada: { submitted: false, valid: false, loading: false },
    us: { submitted: false, valid: false, loading: false },
    netherlands: { submitted: false, valid: false, loading: false }
  });

  const handleSubmit = async (e, country) => {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (!name || !email) {
      setSubmissions(prev => ({
        ...prev,
        [country]: { ...prev[country], valid: false }
      }));
      return;
    }

    setSubmissions(prev => ({
      ...prev,
      [country]: { ...prev[country], loading: true }
    }));

    try {
      const response = await fetch('http://13.201.58.112:5000/submit-invest-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, country }),
      });

      const data = await response.json();
      //alfa beta
      if (data.success) {
        setSubmissions(prev => ({
          ...prev,
          [country]: { ...prev[country], submitted: true, valid: true, loading: false }
        }));
      } else {
        setSubmissions(prev => ({
          ...prev,
          [country]: { ...prev[country], valid: false, loading: false }
        }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissions(prev => ({
        ...prev,
        [country]: { ...prev[country], valid: false, loading: false }
      }));
    }
  };

  return (
    <div className="invest-container">
      <h1 className="invest-heading">Invest in Top Countries</h1>
      
      <div className="invest-flags">
        {[{id: 'canada', name: 'Canada'}, {id: 'us', name: 'USA'}, {id: 'netherlands', name: 'Netherlands'}].map(country => (
          <div key={country.id} className="flag-container">
            <div className="card">
              <div className="card-front">
                <img src={`/${country.name}.png`} alt={`${country.name} Flag`} className="invest-flag" />
                <p className="country-name">{country.name}</p>
              </div>
              <div className="card-back">
                <form 
                  onSubmit={(e) => handleSubmit(e, country.id)}
                  className="contact-form"
                >
                  {submissions[country.id].submitted && submissions[country.id].valid ? (
                    <p className="thank-you">Thank you for your inquiry!</p>
                  ) : (
                    <>
                      <label className="contact-label">Contact Us</label>
                      <input 
                        type="text" 
                        placeholder="Your Name"
                        required
                        style={{ borderRadius: '12px' }}
                        disabled={submissions[country.id].loading}
                      />
                      <input 
                        type="email" 
                        placeholder="Your Email"
                        required
                        style={{ borderRadius: '12px' }}
                        disabled={submissions[country.id].loading}
                      />
                      <button 
                      className='submi1'
                        type="submit"
                        style={{ borderRadius: '12px' }}
                        disabled={submissions[country.id].loading}
                      >
                        {submissions[country.id].loading ? 'Submitting...' : 'Submit'}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invest;