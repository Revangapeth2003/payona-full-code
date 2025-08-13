import React, { useState } from 'react';
const GPTIntegration = () => {
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setAiResponse(data.message);
    } catch (error) {
      setAiResponse('Error communicating with ChatGPT');
      console.error('Error:', error);
    } finally {
      setUserMessage('');
    }
  };

  return (
    <div className="gpt-container">
      <form onSubmit={handleSubmit}>
        <input
          className="input-question"
          type="text"
          placeholder="Ask anything about studying abroad..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <div className="button-container">
          <button className="submit-btn" type="submit">Submit</button>
          <button 
            className="refresh-btn" 
            onClick={(e) => {
              e.preventDefault();
              setUserMessage('');
              setAiResponse('');
            }}
          >
            Refresh
          </button>
        </div>
      </form>

      <h2 className="ask-heading">Feel Free To Ask What You Need</h2>

      <div className="ask-area-container">
        <div className="message ai">{aiResponse || 'AI response will appear here'}</div>
      </div>
    </div>
  );
};

export default GPTIntegration;
