import React from 'react';
import './Language.css';

const levelDescriptions = {
  French: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  German: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Japanese: ['N5', 'N4', 'N3', 'N2', 'N1'],
  Mandarin: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'],
  Russian: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Portuguese: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Spanish: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  English: ['	CEFR B1','CEFR B2' ],
  Korean: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Dutch: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Italian: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Indonesian: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Arabic: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Hindi: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Swahili: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  Turkish: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
};

const LanguageCard = ({ language, className, levels }) => {
  return (
    <div className="lang-card">
      <div className="lang-card-inner">
        <div className={`lang-card-front ${className}`}>
          {language}
        </div>
        <div className={`lang-card-back ${className}`}>
          {levels.map((level, index) => (
            <div key={index} className="lang-level">{level}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Language = () => {
  const languages = [
    { name: 'French', class: 'french' },
    { name: 'German', class: 'german' },
    { name: 'Japanese', class: 'japanese' },
    { name: 'Mandarin', class: 'chinese' },
    { name: 'Russian', class: 'russian' },
    { name: 'Portuguese', class: 'portuguese' },
    { name: 'Spanish', class: 'spanish' },
    { name: 'English', class: 'english' },
    { name: 'Korean', class: 'korean' },
    { name: 'Dutch', class: 'dutch' },
    { name: 'Italian', class: 'italian' },
    { name: 'Indonesian', class: 'indonesian' },
    { name: 'Arabic', class: 'arabic' },
    { name: 'Hindi', class: 'hindi' },
    { name: 'Swahili', class: 'swahili' },
    { name: 'Turkish', class: 'turkish' },
  ];

  return (
    <section className="language-section">
      <div className="language-left">
        <h1>Languages Training</h1>
        <p>Language is the ultimate tool to move forward</p>
      </div>
      <div className="language-right">
        {languages.map((lang, i) => (
          <LanguageCard
            key={i}
            language={lang.name}
            className={lang.class}
            levels={levelDescriptions[lang.name]}
          />
        ))}
      </div>
    </section>
  );
};

export default Language;
