import { useState, useEffect } from "react";
import { ref, get, set, increment } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

import BackgroundClose from "./BackgroundClose";
import iconCrossImg from "../images/cross.svg";
import '../styles/QuestionPush.css';
import CustomInput from './CustomInput.js';
import CustomTextarea from './CustomTextarea.js';

import { sendEmail } from '../Controller/emailService';

function QuestionPush({ setShowQuestionPush }) {
  const [Stage, setStage] = useState(1);
  const [questionNumber, setQuestionNumber] = useState(null);
  const [userData, setUserData] = useState({});
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    // Получаем автоинкрементный номер вопроса
    fetchQuestionNumber();

    // Получаем данные пользователя
    fetchUserData();
  }, []);

  const fetchQuestionNumber = async () => {
    try {
      const questionNumberRef = ref(database, 'Support/QuestionNumber');
      const snapshot = await get(questionNumberRef);
      let currentNumber = 1;
      if (snapshot.exists()) {
        currentNumber = snapshot.val() + 1;
      }
      setQuestionNumber(currentNumber);
      // Обновляем номер вопроса в Firebase
      await set(questionNumberRef, currentNumber);
    } catch (error) {
      console.error('Ошибка при получении номера вопроса:', error);
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

      const emailSubject = subject;
      const emailText = `
        <p><strong>Вопрос №${questionNumber}</strong></p>
        <p><strong>От:</strong> ${fullName} ${email} ${phone}</p>
        <p><strong>Тема:</strong> ${subject}</p>
        <p><strong>Вопрос:</strong></p>
        <p>${text}</p>
      `;
      console.log('emailSubject:', emailSubject); // Добавьте эту строку
      console.log('emailText:', emailText);
      // Вызываем функцию отправки письма
      await sendEmail({
        subject: emailSubject,
        text: emailText,
        html: emailText,
      });

      setStage(2); // Переходим к следующему этапу
    } catch (error) {
      console.error('Ошибка при отправке вопроса:', error);
      alert('Произошла ошибка при отправке вопроса. Пожалуйста, попробуйте еще раз.');
    }
  };

  return (
    <>
      <div className="question-push auth-push">
        <img
          src={iconCrossImg}
          alt=""
          className="auth-push-close-img"
          onClick={() => setShowQuestionPush(false)}
        />
        {Stage === 1 && (
          <>
            <p className="question-push-title">Задать вопрос</p>
            <p className="question-push-question-number">
              Вопрос №{questionNumber || '...'}
            </p>
            <p className="question-push-from">
              От {userData.surname || ''} {userData.Name || ''}{' '}
              {userData.email || ''} {userData.phone || ''}
            </p>
            <CustomInput
              width="420px"
              placeholder="Тема"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <CustomTextarea
              width="420px"
              placeholder="Ваш вопрос"
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
            <p className="question-push-title">Вопрос успешно отправлен!</p>
            <p className="question-push-question-number">
              Ответ от менеджера придёт вам на почту в ближайшее время
            </p>
            <div
              className="btn-question-ok"
              onClick={() => setShowQuestionPush(false)}
            >
              <p>Хорошо</p>
            </div>
          </>
        )}
      </div>
      <BackgroundClose closeWindow={() => setShowQuestionPush(false)} />
    </>
  );
}

export default QuestionPush;