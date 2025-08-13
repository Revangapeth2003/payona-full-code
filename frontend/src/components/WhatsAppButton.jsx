// src/components/WhatsAppButton.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  return (
    <div className="whatsapp-fixed">
      <a
        href="https://wa.me/917806925669"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-buttonn"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp className="whatsapp-iconn" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
