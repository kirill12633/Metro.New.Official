import nodemailer from 'nodemailer';

let transporter = null;

const initTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Подтверждение email - Метро New',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добро пожаловать, ${name}!</h2>
        <p>Спасибо за регистрацию в Метро New.</p>
        <p>Пожалуйста, подтвердите свой email:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px;">Подтвердить email</a>
        <p>Ссылка действительна 24 часа.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© Метро New</p>
      </div>
    `
  };
  
  try {
    await initTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Сброс пароля - Метро New',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Сброс пароля</h2>
        <p>Здравствуйте, ${name}!</p>
        <p>Перейдите по ссылке для сброса пароля:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px;">Сбросить пароль</a>
        <p>Ссылка действительна 1 час.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© Метро New</p>
      </div>
    `
  };
  
  try {
    await initTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};
