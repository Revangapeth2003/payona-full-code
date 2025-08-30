export const validateEmail = e =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const validateName = n =>
  /^[a-zA-Z\s]{2,}$/.test(n.trim());

export const validateAge = a => {
  const n = Number(a);
  return !isNaN(n) && n>=16 && n<=65;
};

export const generateMessageId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
