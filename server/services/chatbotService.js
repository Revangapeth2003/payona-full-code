import { getUserBySocket, updateUser } from '../models/chatbot.model.js';

// Validation functions
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateName = (name) => {
  return /^[a-zA-Z\s]+$/.test(name.trim()) && name.trim().length >= 2;
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 16 && numAge <= 65;
};

// Email service function (import from your email service)
export const sendChatbotEmail = async (emailData, type) => {
  // Your existing sendChatbotEmail implementation
  console.log(`Sending ${type} email for:`, emailData.name);
  return true; // Replace with actual email sending logic
};

export const processConversationStep = async (socket, conversationId, response, socketId) => {
  const user = await getUserBySocket(socketId);
  if (!user) return;

  const step = user.step || 0;
  console.log(`🔄 Processing step ${step}: "${response}"`);

  const requestMessage = (path, replacements, delay = 300) => {
    setTimeout(() => {
      socket.emit('fetch-message', { path, replacements });
    }, delay);
  };

  const showOptions = (options, delay = 500) => {
    setTimeout(() => {
      socket.emit('show-options', options);
    }, delay);
  };

  switch(step) {
    case 0: // Get Started
      if (response === 'Get Started') {
        await updateUser(socketId, conversationId, { step: 1 });
        requestMessage('prompts.name');
      }
      break;
      
    case 1: // Name validation
      if (validateName(response)) {
        await updateUser(socketId, conversationId, { step: 2, name: response.trim() });
        requestMessage('prompts.nameSuccess', { name: response.trim() });
      } else {
        requestMessage('validation.nameInvalid');
      }
      break;
      
    case 2: // Age validation
      if (validateAge(response)) {
        await updateUser(socketId, conversationId, { step: 3, age: response });
        requestMessage('prompts.age');
      } else {
        requestMessage('validation.ageInvalid');
      }
      break;
      
    case 3: // Email validation
      if (validateEmail(response)) {
        await updateUser(socketId, conversationId, { step: 4, email: response.toLowerCase() });
        requestMessage('prompts.email');
        showOptions([
          { text: "📚 Study", value: "Study", className: "study-btn" },
          { text: "💼 Work", value: "Work", className: "work-btn" }
        ]);
      } else {
        requestMessage('validation.emailInvalid');
      }
      break;
      
    case 4: // Purpose selection
      if (response === 'Study') {
        await updateUser(socketId, conversationId, { step: 50, purpose: response, currentFlow: 'study' });
        requestMessage('qualificationOptions.study');
        showOptions([
          { text: "🎓 12th Completed", value: "12th Completed", className: "qualification-btn" },
          { text: "🎓 UG Completed", value: "UG Completed", className: "qualification-btn" },
          { text: "🎓 PG Completed", value: "PG Completed", className: "qualification-btn" }
        ]);
      } else if (response === 'Work') {
        await updateUser(socketId, conversationId, { step: 5, purpose: response, currentFlow: 'work' });
        requestMessage('prompts.passport');
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectStudyOrWork');
      }
      break;

    // Work Flow Cases (5-19)
    case 5: // Passport question
      if (response === 'Yes' || response === 'No') {
        const nextStep = response === 'No' ? 19 : 6;
        await updateUser(socketId, conversationId, { 
          passport: response, 
          step: nextStep
        });
        
        if (response === 'No') {
          requestMessage('responses.noPassport');
          setTimeout(async () => {
            requestMessage('responses.noPassportContinue');
            showOptions([
              { text: "✅ Yes", value: "Yes", className: "yes-btn" },
              { text: "📘 Claim Free Passport", value: "Claim Free Passport", className: "passport-btn" },
              { text: "📝 Register Now", value: "Register Now", className: "register-btn" }
            ]);
          }, 1000);
        } else {
          requestMessage('prompts.resume');
          showOptions([
            { text: "📄 Upload Resume", value: "Upload Resume", className: "upload-btn" },
            { text: "🚫 No Resume", value: "No Resume", className: "no-resume-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 6: // Resume handling
      if (response === 'Upload Resume') {
        socket.emit('trigger-file-upload');
      } else if (response === 'No Resume') {
        await updateUser(socketId, conversationId, { resume: 'No resume', step: 7 });
        requestMessage('prompts.qualification');
        showOptions([
          { text: "🎓 12th Completed", value: "12th Completed", className: "qualification-btn" },
          { text: "🎓 UG Completed", value: "UG Completed", className: "qualification-btn" },
          { text: "🎓 PG Completed", value: "PG Completed", className: "qualification-btn" }
        ]);
      }
      break;

    case 7: // Qualification selection (Work flow)
      const qualifications = ["12th Completed", "UG Completed", "PG Completed"];
      if (qualifications.includes(response)) {
        if (response === "UG Completed") {
          await updateUser(socketId, conversationId, { qualification: response, step: 14, currentFlow: 'ug_selection' });
          requestMessage('prompts.ugMajor');
          showOptions([
            { text: "⚕️ MBBS", value: "MBBS", className: "major-btn" },
            { text: "🦷 BDS", value: "BDS", className: "major-btn" },
            { text: "💊 Pharmacy", value: "Pharmacy", className: "major-btn" },
            { text: "🔬 Physiotherapy", value: "Physiotherapy", className: "major-btn" },
            { text: "🧬 Nursing", value: "Nursing", className: "major-btn" },
            { text: "🏥 Other Medical", value: "Other Medical", className: "major-btn" }
          ]);
        } else {
          await updateUser(socketId, conversationId, { qualification: response, step: 8 });
          requestMessage('prompts.workExperience');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectQualification');
      }
      break;

    case 8: // Work experience question
      if (response === 'Yes' || response === 'No') {
        if (response === 'Yes') {
          await updateUser(socketId, conversationId, { workExperience: response, step: 9 });
          requestMessage('prompts.experienceYears');
          showOptions([
            { text: "1-2 years", value: "1-2 years", className: "experience-btn" },
            { text: "3-5 years", value: "3-5 years", className: "experience-btn" },
            { text: "5+ years", value: "5+ years", className: "experience-btn" }
          ]);
        } else {
          await updateUser(socketId, conversationId, { workExperience: response, step: 10, experience: 'No experience' });
          requestMessage('prompts.interestedCategories');
          showOptions([
            { text: "🏗️ Construction", value: "Construction", className: "category-btn" },
            { text: "🍳 Hotel Management", value: "Hotel Management", className: "category-btn" },
            { text: "👩‍⚕️ Healthcare", value: "Healthcare", className: "category-btn" },
            { text: "🛠️ Technical", value: "Technical", className: "category-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 9: // Experience years selection
      const experienceOptions = ["1-2 years", "3-5 years", "5+ years"];
      if (experienceOptions.includes(response)) {
        await updateUser(socketId, conversationId, { experienceYears: response, step: 10, experience: response });
        requestMessage('prompts.interestedCategories');
        showOptions([
          { text: "🏗️ Construction", value: "Construction", className: "category-btn" },
          { text: "🍳 Hotel Management", value: "Hotel Management", className: "category-btn" },
          { text: "👩‍⚕️ Healthcare", value: "Healthcare", className: "category-btn" },
          { text: "🛠️ Technical", value: "Technical", className: "category-btn" }
        ]);
      } else {
        requestMessage('validation.selectExperience');
      }
      break;

    case 10: // Interested categories
      const categories = ["Construction", "Hotel Management", "Healthcare", "Technical"];
      if (categories.includes(response)) {
        await updateUser(socketId, conversationId, { interestedInCategories: response, step: 11 });
        requestMessage('prompts.germanLanguage');
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 11: // German language - Send email
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { germanLanguage: response, step: 12 });
        
        const emailData = {
          name: user.name,
          age: user.age,
          email: user.email,
          purpose: user.purpose,
          passport: user.passport,
          resume: user.resume,
          qualification: user.qualification,
          experience: user.experience,
          interestedInCategories: user.interested_in_categories,
          germanLanguage: response
        };
        
        const emailSent = await sendChatbotEmail(emailData, 'german');
        await updateUser(socketId, conversationId, { emailSent });
        
        if (emailSent) {
          requestMessage('success.emailSent');
        } else {
          requestMessage('errors.emailFailed');
        }
        
        setTimeout(async () => {
          requestMessage('prompts.continueProgram');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }, 1500);
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 12: // Continue program question
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { continueProgram: response, step: 13 });
        
        if (response === 'Yes') {
          requestMessage('prompts.programStart');
          showOptions([
            { text: "🚀 Immediately", value: "Immediately", className: "time-btn" },
            { text: "📅 Within 1 month", value: "Within 1 month", className: "time-btn" },
            { text: "⏰ Within 3 months", value: "Within 3 months", className: "time-btn" },
            { text: "📆 Within 6 months", value: "Within 6 months", className: "time-btn" }
          ]);
        } else {
          requestMessage('responses.noContinueProgram');
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 13: // Program start time
      const startTimes = ["Immediately", "Within 1 month", "Within 3 months", "Within 6 months"];
      if (startTimes.includes(response)) {
        await updateUser(socketId, conversationId, { programStartTime: response });
        requestMessage('summary.thankYouWork', { name: user.name });
      } else {
        requestMessage('validation.selectStartTime');
      }
      break;

    // Continue with other cases for UG flow (14-18) and Study flow (50-57)
    // I'll include a few more important cases...

    case 50: // Study qualification
      const studyQualifications = ["12th Completed", "UG Completed", "PG Completed"];
      if (studyQualifications.includes(response)) {
        await updateUser(socketId, conversationId, { qualification: response, step: 51 });
        requestMessage('prompts.studyCountry');
        showOptions([
          { text: "🇺🇸 USA", value: "USA", className: "country-btn" },
          { text: "🇬🇧 UK", value: "UK", className: "country-btn" },
          { text: "🇨🇦 Canada", value: "Canada", className: "country-btn" },
          { text: "🇦🇺 Australia", value: "Australia", className: "country-btn" },
          { text: "🇩🇪 Germany", value: "Germany", className: "country-btn" },
          { text: "🌍 Other", value: "Other", className: "country-btn" }
        ]);
      } else {
        requestMessage('validation.selectQualification');
      }
      break;

    // ... Add all other cases from your working implementation

    default:
      requestMessage('responses.defaultResponse');
  }
};
