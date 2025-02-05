import { useState, useEffect } from "react";
import { ref, get, set } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

import BackgroundClose from "./BackgroundClose";
import iconCrossImg from "../images/cross.svg";
import '../styles/QuestionPush.css'; // Используем те же стили, что и для QuestionPush
import CustomTextarea from './CustomTextarea.js';

import { sendEmail } from '../Controller/emailService';

function InitiativePush({ setShowInitiativePush }) {
  const [Stage, setStage] = useState(1);
  const [initiativeNumber, setInitiativeNumber] = useState(null);
  const [userData, setUserData] = useState({});
  const [text, setText] = useState('');

  useEffect(() => {
    // Получаем автоинкрементный номер инициативы
    fetchInitiativeNumber();

    // Получаем данные пользователя
    fetchUserData();
  }, []);

  const fetchInitiativeNumber = async () => {
    try {
      const initiativeNumberRef = ref(database, 'Support/InitiativeNumber');
      const snapshot = await get(initiativeNumberRef);
      let currentNumber = 1;
      if (snapshot.exists()) {
        currentNumber = snapshot.val() + 1;
      }
      setInitiativeNumber(currentNumber);
      // Обновляем номер инициативы в Firebase
      await set(initiativeNumberRef, currentNumber);
    } catch (error) {
      console.error('Ошибка при получении номера инициативы:', error);
    }
  };

  const fetchUserData = async () => {
    const userId = Cookies.get('userId');
    if (userId) {
      try {
        const userRef = ref(database, `Users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    }
  };

  const handleSend = async () => {
    try {
      // Формируем данные для отправки письма
      const fullName = `${userData.surname || ''} ${userData.Name || ''}`.trim();
      const email = userData.email || '';
      const phone = userData.phone || '';

      const emailSubject = 'Инициатива';
      const emailText = `
        <p><strong>Инициатива №${initiativeNumber}</strong></p>
        <p><strong>От:</strong> ${fullName} ${email} ${phone}</p>
        <p><strong>Инициатива:</strong></p>
        <p>${text}</p>
      `;

      // Вызываем функцию отправки письма
      await sendEmail({
        subject: emailSubject,
        text: emailText,
        html: emailText,
      });

      setStage(2); // Переходим к следующему этапу
    } catch (error) {
      console.error('Ошибка при отправке инициативы:', error);
      alert('Произошла ошибка при отправке инициативы. Пожалуйста, попробуйте еще раз.');
    }
  };

  return (
    <>
      <div className="question-push auth-push">
        <img
          src={iconCrossImg}
          alt=""
          className="auth-push-close-img"
          onClick={() => setShowInitiativePush(false)}
        />
        {Stage === 1 && (
          <>
            <p className="question-push-title">Предложить инициативу</p>
            <p className="question-push-question-number">
              Инициатива №{initiativeNumber || '...'}
            </p>
            <p className="question-push-from">
              От {userData.surname || ''} {userData.Name || ''} {userData.email || ''} {userData.phone || ''}
            </p>
            <CustomTextarea
              width="420px"
              placeholder="Ваша инициатива"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="btn-question-push-send" onClick={handleSend}>
              <p>Отправить</p>
            </div>
          </>
        )}
        {Stage === 2 && (
          <>
            <p className="question-push-title">Инициатива успешно отправлена!</p>
            <p className="question-push-question-number">
              Ответ от менеджера придёт вам на почту в ближайшее время
            </p>
            <div
              className="btn-question-ok"
              onClick={() => setShowInitiativePush(false)}
            >
              <p>Хорошо</p>
            </div>
          </>
        )}
      </div>
      <BackgroundClose closeWindow={() => setShowInitiativePush(false)} />
    </>
  );
}

export default InitiativePush;