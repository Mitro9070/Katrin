// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Loader from './Loader';
import CustomCropper from './CustomCropper';
import '../styles/Profile.css';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCroppedImg } from '../utils/cropImage';
import { fetchUserById, updateUserById, uploadUserImage } from '../Controller/UsersController';
import { fetchRoleById } from '../Controller/RolesController';
import { fetchOffices } from '../Controller/OfficesController';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

const Profile = () => {
    const { userId } = useParams();
    const currentUserId = Cookies.get('userId');
    const [currentTab, setCurrentTab] = useState('PersonalData');
    const [loading, setLoading] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false);
    const [userData, setUserData] = useState({});
    const [roleName, setRoleName] = useState('');
    const [offices, setOffices] = useState([]);
    const [inputData, setInputData] = useState({});
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        console.log("Profile userId:", userId); 
        const fetchData = async () => {
            try {
                console.log("Fetching user data...");
                const userData = await fetchUserById(userId);
                console.log("Fetched userData:", userData);
    
                if (userData) {
                    // Извлекаем только дату из полученной строки
                    const formattedBirthday = userData.birthday ? userData.birthday.slice(0, 10) : '';
                    setUserData(userData);
                    setInputData({
                        ...userData,
                        birthday: formattedBirthday,
                    });
                    setImageUrl(userData.image || null);
    
                    if (userData.role) {
                        console.log("Fetching role data for role ID:", userData.role);
                        const roleData = await fetchRoleById(userData.role);
                        console.log("Fetched roleData:", roleData);
                        setRoleName(roleData.rusname || 'Роль не указана');
                    } else {
                        setRoleName('Роль не указана');
                    }
                } else {
                    console.error('Пользователь не найден');
                }
    
                console.log("Fetching offices data...");
                const officesData = await fetchOffices();
                console.log("Fetched officesData:", officesData);
                setOffices(officesData);
    
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input change - ${name}: ${value}`);
    
        setInputData({
            ...inputData,
            [name]: value, // Сохраняем значение как есть
        });
        setIsFormChanged(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            console.log("Saving user data:", inputData);
    
            const updatedData = {
                ...inputData,
                image: imageUrl,
            };
    
            console.log("Updated data being sent to server:", updatedData);
    
            await updateUserById(userId, updatedData);
            setUserData(updatedData);
            setIsFormChanged(false);
            console.log("User data saved successfully");
        } catch (err) {
            console.error('Ошибка при сохранении данных пользователя:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setImageSrc(null);
    };

    const handleCropSave = async (croppedImageBlob) => {
        setShowCropper(false);
        setImageSrc(null);
        setLoadingImage(true);
        try {
            console.log('Получен croppedImageBlob:', croppedImageBlob);

            // Создаём уникальное имя файла для изображения
            const fileName = `profile_${userId}_${Date.now()}.jpg`;

            // Создаём объект File из Blob
            const croppedImageFile = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });

            // Обновляем данные пользователя, включая изображение
            const updatedData = {
                ...inputData,
                image: croppedImageFile, // Передаём файл изображения
            };

            // Вызываем функцию обновления пользователя
            const updatedUser = await updateUserById(userId, updatedData);

            console.log('Изображение загружено, обновлённые данные пользователя:', updatedUser);

            // Обновляем состояние компонента
            setUserData(updatedUser);
            setInputData(updatedUser);
            setImageUrl(updatedUser.image || null);
            setIsFormChanged(false);
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
        } finally {
            setLoadingImage(false);
        }
    };

    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        console.log("Changing tab to:", selectedTab);
        setCurrentTab(selectedTab);
    };

    const getImageUrl = (imageUrl) => {
        return `${serverUrl}/api/webdav/image?url=${encodeURIComponent(imageUrl)}`;
    };

    if (loading) {
        console.log("Loading...");
        return <Loader />;
    }

    const isCurrentUser = currentUserId === userId;
    console.log("isCurrentUser:", isCurrentUser);

    return (
        <div className="content-page page-content">
            <div className="content-page-head noselect">
                <p
                    className={`content-page-head-tab ${currentTab === 'PersonalData' ? 'content-page-head-tab-selected' : ''}`}
                    data-tab="PersonalData"
                    onClick={changeCurrentTabHandler}
                >
                    Личные данные
                </p>
                {isCurrentUser && (
                    <p
                        className={`content-page-head-tab ${currentTab === 'Settings' ? 'content-page-head-tab-selected' : ''}`}
                        data-tab="Settings"
                        onClick={changeCurrentTabHandler}
                    >
                        Настройки
                    </p>
                )}
            </div>
            <div className="content-page-content three-columns">
                {currentTab === 'PersonalData' && (
                    <div className="personal-data-form">
                        <div className="column photo-column">
                            <div className="photo-container" onClick={() => isCurrentUser && document.getElementById('file-input').click()}>
                                {loadingImage && <Loader />}
                                {!imageUrl && !loadingImage && <p>Добавьте ваше фото</p>}
                                {imageUrl && !loadingImage && <img src={getImageUrl(imageUrl)} alt="Фото пользователя" />}
                            </div>
                            <div className="role-label">
                                Роль: {roleName}
                            </div>
                        </div>
                        <div className="column fields-column">
                            <label>Фамилия</label>
                            <input
                                type="text"
                                name="surname"
                                value={inputData.surname || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.surname ? 'input-error' : ''}`}
                                readOnly={!isCurrentUser}
                            />
                            <label>Имя</label>
                            <input
                                type="text"
                                name="name"
                                value={inputData.name || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.name ? 'input-error' : ''}`}
                                readOnly={!isCurrentUser}
                            />
                            <label>Отчество</label>
                            <input
                                type="text"
                                name="lastname"
                                value={inputData.lastname || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                                readOnly={!isCurrentUser}
                            />
                            <label>Пол</label>
                            <select
                                name="sex"
                                value={inputData.sex || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                                disabled={!isCurrentUser}
                            >
                                <option value="" disabled>Выбрать пол</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={inputData.email || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${(!inputData.email || !validateEmail(inputData.email)) ? 'input-error' : ''}`}
                                readOnly={!isCurrentUser}
                            />
                            <label>Телефон</label>
                            <input
                                type="text"
                                name="phone"
                                value={inputData.phone || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                                placeholder="+7 (***) ***-**-**"
                                readOnly={!isCurrentUser}
                            />
                        </div>
                        <div className="column fields-column">
                            <label>Выберите офис</label>
                            <select
                                name="office"
                                value={inputData.office || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.office ? 'input-error' : ''}`}
                                disabled={!isCurrentUser}
                            >
                                <option value="" disabled>Выбрать офис</option>
                                {offices && offices.map((office) => (
                                    <option key={office.id} value={office.id}>
                                        {office.name_office}
                                    </option>
                                ))}
                            </select>
                            <label>Должность</label>
                            <input
                                type="text"
                                name="position"
                                value={inputData.position || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.position ? 'input-error' : ''}`}
                                style={{ marginTop: '3px' }}
                                readOnly={!isCurrentUser}
                            />
                            <label>Дата рождения</label>
                            <input
                                type="date"
                                name="birthday"
                                value={inputData.birthday || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                                readOnly={!isCurrentUser}
                            />
                            {isCurrentUser && isFormChanged && (
                                <button
                                    className="save-button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={{ margin: '20px auto', display: 'block' }}
                                >
                                    Применить изменения
                                </button>
                            )}
                        </div>
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                            disabled={!isCurrentUser}
                        />
                    </div>
                )}
                {isCurrentUser && currentTab === 'Settings' && (
                    <div>
                        <h2>Настройки</h2>
                        <p>В разработке...</p>
                    </div>
                )}

                {showCropper && createPortal(
                    <CustomCropper
                        imageSrc={imageSrc}
                        onCancel={handleCropCancel}
                        onSave={handleCropSave}
                    />,
                    document.body
                )}
            </div>
        </div>
    );
};

// Функция для проверки правильности email
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export default Profile;