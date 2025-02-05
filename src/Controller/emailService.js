// emailService.js

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL || '';

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    console.log('Отправка письма с данными:', {
        to: to || supportEmail,
        subject,
        text,
        html,
        attachments,
      }); 
    
    const response = await fetch(`${serverUrl}/api/email/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to || supportEmail,
        subject,
        text,
        html,
        attachments,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при отправке сообщения');
    }

    const result = await response.json();
    return result.message || 'Сообщение успешно отправлено';
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
};