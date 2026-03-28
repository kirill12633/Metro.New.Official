import validator from 'validator';

// Черный список доменов
const BLACKLIST_DOMAINS = [
  'temp-mail.org',
  '10minutemail.com',
  'throwaway.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'tempmail.com'
];

// Зарезервированные имена
const RESERVED_USERNAMES = [
  'admin', 'root', 'support', 'moderator', 'metro', 
  'system', 'service', 'help', 'info', 'test'
];

// Проверка email
export const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    return { valid: false, message: 'Неверный формат email' };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  
  if (BLACKLIST_DOMAINS.includes(domain)) {
    return { valid: false, message: 'Этот email домен заблокирован' };
  }
  
  return { valid: true, message: '' };
};

// Проверка username
export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { valid: false, message: 'Никнейм минимум 3 символа' };
  }
  
  if (username.length > 20) {
    return { valid: false, message: 'Никнейм не более 20 символов' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Только буквы, цифры и _' };
  }
  
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { valid: false, message: 'Это имя занято' };
  }
  
  return { valid: true, message: '' };
};

// Проверка пароля
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Пароль минимум 8 символов', score: 0 };
  }
  
  let score = 1;
  const missing = [];
  
  if (/[A-Z]/.test(password)) score++;
  else missing.push('заглавные буквы');
  
  if (/[0-9]/.test(password)) score++;
  else missing.push('цифры');
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else missing.push('спецсимволы');
  
  const isValid = score >= 3;
  const message = isValid ? 'Хороший пароль' : `Добавьте: ${missing.join(', ')}`;
  
  return {
    valid: isValid,
    message,
    score: Math.min(4, score),
    text: ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный'][score]
  };
};

// Проверка возраста
export const validateAge = (day, month, year) => {
  if (!day || !month || !year) {
    return { valid: false, age: 0, message: 'Укажите дату рождения' };
  }
  
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 13) {
    return { valid: false, age, message: 'Регистрация доступна с 13 лет' };
  }
  
  return { valid: true, age, message: '' };
};
