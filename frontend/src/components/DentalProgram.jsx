
import React from 'react'
import { dentalData } from './dentalData'
import './DentalProgram.css'

const DentalProgram = () => {
  return (
    <div className='dental-hero'>
      <div className="dental-hero-text">
        <h1>STUDY</h1>
        <h2 style={{ fontWeight: 'normal' }}>PROGRAM</h2>
        <p>let us see how it works and let us seethem according to some countries </p>
      </div>
      <div className="dental-grid">
        {dentalData.map((item, index) => (
          <div className="dental-card" key={index}>
            <div className="dental-card-inner">
              <div className="dental-card-front">
                <h2>{item.name}</h2>
              </div>
              <div className="dental-card-back">
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
  )
}

export default DentalProgram