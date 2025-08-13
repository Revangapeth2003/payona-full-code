import React, { useState } from 'react';
import { visaData } from './visaData'; 
import './Techarts.css';
import { FaArrowRight, FaSyncAlt } from 'react-icons/fa';

const Techarts = () => {
  const [userMessage, setUserMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    setUserMessage('');
  };
  return (
    <div className='visatotal'> 
      <div className='visa-hero2'>
        <div className="visa-hero2text">
          <h1>MOST IMMIGRATED COUNTRIES AND VISAS</h1>
        </div>
        <div className="visa-threed">
          {visaData.map((item, index) => (
            <div className="visa-cardvisa" key={index}>
              <div className="visa-cardvisa-inner">
                <div className="visa-cardvisa-front" style={{ backgroundImage: `url(/${item.name}.png)` }}>
                  <h3>{item.name}</h3>
                </div>
                <div className="visa-cardvisa-back">
                  <ul>
                    {item.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='gpt'>
        <h1>Feel free to ask questions to our Ritza</h1>
        <div className="gptsecond">
          <img className='ritzaimg' src="/jack.jpeg" alt="" />
          <h2>Ritza will speak to you soon ...</h2>
        </div>

        <form className='gptform' onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Ask our Ritza..."
            aria-label="Chat input"
          />
          <button type="submit" aria-label="Send">
            <FaArrowRight />
          </button>
          <button type="button" onClick={() => setUserMessage('')} aria-label="Clear">
            <FaSyncAlt />
          </button>
        </form>

        <div className="ask-area-container">
         <div className="message ai">Coming soon ...</div>
                 
       </div>
      </div>
    </div>
  );
};  

export default Techarts;