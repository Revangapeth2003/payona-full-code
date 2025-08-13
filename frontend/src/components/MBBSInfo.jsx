
import React from 'react';
import { mbdata } from './mbdata.js';
import './MBBSInfo.css';

const MBBSInfo = () => {
  return (
    <div className="mbbs-hero">
      <div className="mbbs-text">
        <h1>MBBS Abroad</h1>
        <p>
          Explore top countries to pursue MBBS with expert guidance and support throughout the process.
        </p>
       
      </div>
      <div className="mbbs-cards">
        {mbdata.map((item, index) => (
          <div className="mbbs-card" key={index}>
            <div className="mbbs-card-inner">
              <div className="mbbs-card-front" style={{ backgroundImage: `url(/${item.name}.png)` }}>
                <h2>{item.name}</h2>
              </div>
              <div className={`mbbs-card-back ${item.name === 'Germany' ? 'light-green-bg' : ''}`}>
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
  );
};
export default MBBSInfo;
