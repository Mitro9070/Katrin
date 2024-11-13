import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { storage, database } from '../firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Loader from './Loader';
import '../styles/AddEmployee.css';

// Объявление функционального компонента AddEmployee
const AddEmployee = ({ offices, roles, refreshUsers }) => {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [office, setOffice] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Функция для обработки выбора файла изображения
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const imgRef = storageRef(storage, `employee-photos/${file.name}`);
        await uploadBytes(imgRef, file);
        const url = await getDownloadURL(imgRef);
        setImageUrl(url);
        setImageFile(file);
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Функция для имитации отправки email
  const sendEmail = (recipientEmail, tempPassword) => {
    const emailContent = `
      Приветствуем тебя на портале Катюша. Данные для входа на портал:\n
      Логин: ${recipientEmail}\n
      Пароль: ${tempPassword}\n
      Пароль можно будет сменить в личном кабинете (кнопка Профиль).\n
      С уважением. Администратор портала Катюша.
    `;

    // Имитация отправки письма
    console.log("Отправка письма на email:");
    console.log(emailContent);

    // Отображение сообщения
    setMessage(`Письмо для пользователя ${recipientEmail} успешно сымитировано:\n${emailContent}`);
  };

  // Функция для очистки полей формы после успешной регистрации
  const clearFields = () => {
    setSurname('');
    setName('');
    setLastname('');
    setBirthday('');
    setEmail('');
    setOffice('');
    setPosition('');
    setRole('');
    setImageUrl(null);
    setImageFile(null);
  };

  // Функция для обработки сохранения нового сотрудника
  const handleSave = async () => {
    setLoading(true);
    const auth = getAuth();
    const tempPassword = Math.random().toString(36).slice(-8); // Генерация временного пароля

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const userId = userCredential.user.uid;

      // Имитация отправки письма с данными для входа
      sendEmail(email, tempPassword);

      const userRef = ref(database, `Users/${userId}`);
      const newUser = {
        surname,
        Name: name,
        lastname,
        birthday,
        email,
        office,
        position,
        role,
        image: imageUrl,
        createdAt: new Date().toISOString(),
      };
      await set(userRef, newUser);

      refreshUsers();
      clearFields();  // Очистка полей формы после успешной регистрации
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
          {imageUrl ? <img src={imageUrl} alt="Фото сотрудника" /> : 'Загрузить фото'}
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
            <label>Фамилия</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="custom-input"
            />
            <label>Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="custom-input"
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
          </div>
          <div className="fields-column">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="custom-input"
              style={{ border: validateEmail(email) ? '1px solid #A9A9A9' : '1px solid red' }}
              required
            />
            <label>Выберите офис</label>
            <select
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="custom-input custom-select"
            >
              <option value='' disabled>Выбрать офис</option>
              {Object.keys(offices).map((officeId) => (
                <option key={officeId} value={officeId}>
                  {offices[officeId]}
                </option>
              ))}
            </select>
            <label>Должность</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="custom-input"
            />
            <label>Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="custom-input custom-select"
            >
              <option value='' disabled>Выбрать роль</option>
              {Object.keys(roles).map((roleId) => (
                <option key={roleId} value={roleId}>
                  {roles[roleId].rusname}
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
            disabled={!validateEmail(email) || !surname || !name || !lastname || !birthday || !email || !office || !position || !role}
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