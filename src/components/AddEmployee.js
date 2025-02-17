// src/components/AddEmployee.js

import React, { useState } from 'react';
// Импортируем необходимые методы из контроллера пользователей
import { addUser, updateUserById, uploadUserImage } from '../Controller/UsersController';
import Loader from './Loader';
import '../styles/AddEmployee.css';
import { sendEmail } from '../Controller/emailService';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

const AddEmployee = ({ offices, roles, refreshUsers }) => {
  // Состояния для хранения данных формы
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [sex, setSex] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [office, setOffice] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Обработчик изменения файла изображения
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Функция для валидации email
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Функция для валидации телефона
  const validatePhone = (phone) => {
    const re = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return re.test(String(phone));
  };

  // Форматирование номера телефона
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 2) return '+7';
    if (phoneNumberLength <= 4) return `+7 (${phoneNumber.slice(1)}`;
    if (phoneNumberLength <= 7) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumberLength <= 9) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedPhoneNumber);
  };

  // Функция отправки имитационного письма (заглушка)
  const sendWelcomeEmail = async (recipientEmail, tempPassword) => {
    try {
      await sendEmail({
        to: recipientEmail,
        subject: 'Данные для входа на портал',
        text: `
          Приветствуем вас на портале Катюша! Данные для входа на портал:
          Логин: ${recipientEmail}
          Пароль: ${tempPassword}
          Пароль можно будет сменить в личном кабинете.
          С уважением, Администратор портала.
        `,
      });

      setMessage(`Письмо для пользователя ${recipientEmail} успешно отправлено.`);
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
      setError('Не удалось отправить письмо пользователю.');
    }
  };

  // Функция очистки полей после успешного добавления пользователя
  const clearFields = () => {
    setSurname('');
    setName('');
    setLastname('');
    setBirthday('');
    setSex('');
    setEmail('');
    setPhone('');
    setOffice('');
    setPosition('');
    setRole('');
    setImageFile(null);
  };

  // Обработчик нажатия на кнопку "Сохранить"
  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const emailIsValid = validateEmail(email);

    if (!surname || !name || !emailIsValid || !office || !position) {
      setError('Заполните обязательные поля.');
      setLoading(false);
      return;
    }

    try {
      // Генерируем временный пароль
      const tempPassword = Math.random().toString(36).slice(-8);

      // Создаем пользователя методом addUser
      const { userId } = await addUser({
        email,
        password: tempPassword,
        name,
        surname,
        lastname,
        role,
      });

      if (!userId) {
        throw new Error('Не удалось получить идентификатор пользователя.');
      }

      // Отправляем письмо с данными для входа
      await sendWelcomeEmail(email, tempPassword);

      // Подготавливаем данные для обновления профиля пользователя
      const additionalData = {
        email,
        name,
        surname,
        lastname,
        birthday,
        sex,
        phone,
        office,
        position,
        role,
      };

      // Если есть изображение, добавляем его
      if (imageFile) {
        additionalData.image = imageFile;
      }

      // Обновляем данные пользователя
      await updateUserById(userId, additionalData);

      // Обновляем список пользователей
      refreshUsers();
      clearFields();
      setMessage('Пользователь успешно добавлен.');
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      setError('Ошибка при добавлении пользователя.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-employee">
      <h2>Добавление нового сотрудника</h2>
      <div className="add-employee-form">
        <div className="photo-container" onClick={() => document.getElementById('file-input').click()}>
          {imageFile ? (
            <img src={URL.createObjectURL(imageFile)} alt="Фото сотрудника" />
          ) : (
            'Загрузить фото'
          )}
          {loading && <Loader />}
        </div>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="form-columns">
          <div className="fields-column">
            <label>Фамилия*</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className={`custom-input ${!surname && 'input-error'}`}
            />
            <label>Имя*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`custom-input ${!name && 'input-error'}`}
            />
            <label>Отчество</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="custom-input"
            />
            <label>Дата рождения</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="custom-input"
            />
            <label>Пол</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="custom-input"
            >
              <option value="" disabled>Выбрать пол</option>
              <option value="Мужчина">Мужчина</option>
              <option value="Женщина">Женщина</option>
            </select>
          </div>
          <div className="fields-column">
            <label>Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`custom-input ${(!email || !validateEmail(email)) && 'input-error'}`}
              required
            />
            <label>Телефон</label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              className={`custom-input ${phone && !validatePhone(phone) && 'input-error'}`}
              placeholder="+7 (***) ***-**-**"
            />
            <label>Выберите офис*</label>
            <select
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className={`custom-input ${!office && 'input-error'}`}
            >
              <option value="" disabled>Выбрать офис</option>
              {offices.map((officeItem) => (
                <option key={officeItem.id} value={officeItem.id}>
                  {officeItem.name_office}
                </option>
              ))}
            </select>
            <label>Должность*</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={`custom-input ${!position && 'input-error'}`}
              style={{ marginTop: '3px' }} /* Смещение на 3px */
            />
            <label>Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="custom-input custom-select"
            >
              <option value="" disabled>Выбрать роль</option>
              {roles.map((roleItem) => (
                <option key={roleItem.id} value={roleItem.id}>
                  {roleItem.rusname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="footer">
        {loading ? (
          <Loader />
        ) : (
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!validateEmail(email) || !surname || !name || !office || !position}
          >
            Зарегистрировать пользователя
          </button>
        )}
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default AddEmployee;