// Генерация простой капчи
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

// Добавляем капчу в форму
function addCaptchaToForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const captchaDiv = document.createElement('div');
  captchaDiv.className = 'captcha-container';
  captchaDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
      <div id="captchaText" style="
        background: #f0f0f0; 
        padding: 10px; 
        border-radius: 5px; 
        font-family: monospace; 
        font-size: 18px; 
        font-weight: bold;
        letter-spacing: 2px;
      "></div>
      <button type="button" id="refreshCaptcha" style="padding: 5px 10px;">🔄</button>
    </div>
    <input type="text" id="captchaInput" placeholder="Введите код с картинки" style="padding: 10px; width: 200px;">
  `;
  
  form.appendChild(captchaDiv);
  
  // Генерируем и показываем капчу
  let currentCaptcha = generateCaptcha();
  document.getElementById('captchaText').textContent = currentCaptcha;
  
  // Обновление капчи
  document.getElementById('refreshCaptcha').addEventListener('click', () => {
    currentCaptcha = generateCaptcha();
    document.getElementById('captchaText').textContent = currentCaptcha;
    document.getElementById('captchaInput').value = '';
  });
  
  return () => {
    const userInput = document.getElementById('captchaInput').value.toUpperCase();
    return userInput === currentCaptcha;
  };
}

// Использование в формах
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const validateCaptcha = addCaptchaToForm('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Проверяем капчу
    if (!validateCaptcha()) {
      alert('Неверный код капчи!');
      return;
    }
    
    // Остальная логика входа...
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'profile.html';
    } catch (error) {
      alert('Ошибка входа: ' + error.message);
    }
  });
}
