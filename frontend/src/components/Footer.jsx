import React from "react";
import "./Footer.css";
import {
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";

const Footer = () => {
  const openMap = () => {
    window.open(
      "https://www.google.com/maps/place/Payana+Overseas+Solutions/@11.3373413,77.7094131,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba96f1e295f1439:0x270c72cecda7d00b!8m2!3d11.3373361!4d77.711988!16s%2Fg%2F11rw8zmhkc?entry=ttu",
      "_blank"
    );
  };

  const sections = [
    {
      title: "Contact",
      email: "payanaoverseas@gmail.com",
      phones: ["+91 90036 19777", "+1 647 834 2003"],
    },
    {
      title: "Study",
      email: "study@payanaoverseas.com",
      phones: ["+91 90036 19777"],
    },
    {
      title: "Work",
      email: "work@payanaoverseas.com",
      phones: ["+91 70108 38005"],
    },
  
  ];

  return (
    <footer className="footer">
      <div className="footer-left-group">
        {sections.map((section, index) => (
          <div className="footer-section" key={index}>
            <h3>{section.title}</h3>
            {section.email && (
              <p>
                <FaEnvelope className="icon" /> {section.email}
              </p>
            )}
            {section.phones &&
              section.phones.map((phone, i) => (
                <p key={i}>
                  <FaPhone className="icon" /> {phone}
                </p>
              ))}
          </div>
        ))}


<div className="fottersocial-icons">
          <a href="https://www.facebook.com/payanaOverseas?locale=hu_HU" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
          <a
            href="https://www.instagram.com/payanaoverseassolutions/"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.youtube.com/channel/UCwhgSMTSMig0sbgN_0mbyHg"
            target="_blank"
            rel="noreferrer"
          >
            <FaYoutube />
          </a>
          <a
            href="https://x.com/PayanaOverseas"
            target="_blank"
            rel="noreferrer"
          >
            <FaXTwitter />
          </a>
        </div>

      
      </div>

      <div className="footer-right" onClick={openMap}>
        <img
          className="map-image"
          src="Screenshot 2025-04-15 152311.png"
          alt="Map Location"
        />
      </div>
    </footer>
  );
};

export default Footer;
