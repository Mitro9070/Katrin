import React, { useState, useEffect } from 'react';
import { ref as databaseRef, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebaseConfig';
import Cookies from 'js-cookie';
import Loader from './Loader';
import Footer from './Footer';
import '../styles/Profile.css';

const Profile = () => {
    const [currentTab, setCurrentTab] = useState('PersonalData');
    const [loading, setLoading] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false); // Новый стейт для загрузки фото
    const [userData, setUserData] = useState({});
    const [roleName, setRoleName] = useState('');
    const [offices, setOffices] = useState({});
    const [inputData, setInputData] = useState({});
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const userId = Cookies.get('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRef = databaseRef(database, `Users/${userId}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    setUserData(userData);
                    setInputData(userData);
                    setImageUrl(userData.image || null); // Placeholder image if not exists

                    if (userData.role) {
                        const roleRef = databaseRef(database, `Roles/${userData.role}`);
                        const roleSnapshot = await get(roleRef);

                        if (roleSnapshot.exists()) {
                            setRoleName(roleSnapshot.val().rusname);
                        }
                    }
                }

                const officesRef = databaseRef(database, 'Offices');
                const officesSnapshot = await get(officesRef);
                if (officesSnapshot.exists()) {
                    setOffices(officesSnapshot.val());
                }

            } catch (err) {
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({
            ...inputData,
            [name]: value
        });
        setIsFormChanged(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const userRef = databaseRef(database, `Users/${userId}`);
            await set(userRef, {
                ...userData,
                ...inputData,
                image: imageUrl
            });
            setUserData(inputData);
            setIsFormChanged(false);
        } catch (err) {
            console.error('Error saving user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoadingImage(true); // Включение загрузочного индикатора для фото
            try {
                const imgRef = storageRef(storage, `employee-photos/${file.name}`);
                await uploadBytes(imgRef, file);
                const url = await getDownloadURL(imgRef);
                setImageUrl(url);
                setIsFormChanged(true); // Обозначение, что форма изменилась
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setLoadingImage(false); // Выключение загрузочного индикатора для фото
            }
        }
    };

    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
    };

    if (loading) return <Loader />;

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
                <p
                    className={`content-page-head-tab ${currentTab === 'Settings' ? 'content-page-head-tab-selected' : ''}`}
                    data-tab="Settings"
                    onClick={changeCurrentTabHandler}
                >
                    Настройки
                </p>
            </div>
            <div className="content-page-content three-columns">
                {currentTab === 'PersonalData' && (
                    <div className="personal-data-form">
                        <div className="column photo-column">
                            <div className="photo-container" onClick={() => document.getElementById('file-input').click()}>
                                {loadingImage && <Loader />}
                                {!imageUrl && !loadingImage && <p>Добавьте пожалуйста Ваше фото</p>}
                                {imageUrl && !loadingImage && <img src={imageUrl} alt="Фото пользователя" />}
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
                                className={`custom-input ${!inputData.surname && 'input-error'}`}
                            />
                            <label>Имя</label>
                            <input
                                type="text"
                                name="Name"
                                value={inputData.Name || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.Name && 'input-error'}`}
                            />
                            <label>Отчество</label>
                            <input
                                type="text"
                                name="lastname"
                                value={inputData.lastname || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                            />
                            <label>Пол</label>
                            <select
                                name="sex"
                                value={inputData.sex || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                            >
                                <option value="" disabled>Выбрать пол</option>
                                <option value="Мужчина">Мужчина</option>
                                <option value="Женщина">Женщина</option>
                            </select>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={inputData.email || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${(!inputData.email || !validateEmail(inputData.email)) && 'input-error'}`}
                            />
                            <label>Телефон</label>
                            <input
                                type="text"
                                name="phone"
                                value={inputData.phone || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                                placeholder="+7 (***) ***-**-**"
                            />
                        </div>
                        <div className="column fields-column">
                            <label>Выберите офис</label>
                            <select
                                name="office"
                                value={inputData.office || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.office && 'input-error'}`}
                            >
                                <option value="" disabled>Выбрать офис</option>
                                {Object.keys(offices).map((officeId) => (
                                    <option key={officeId} value={officeId}>
                                        {offices[officeId]}
                                    </option>
                                ))}
                            </select>
                            <label>Должность</label>
                            <input
                                type="text"
                                name="position"
                                value={inputData.position || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.position && 'input-error'}`}
                                style={{ marginTop: '3px' }} // 3px margin for positioning
                            />
                            <label>Дата рождения</label>
                            <input
                                type="date"
                                name="birthday"
                                value={inputData.birthday || ''}
                                onChange={handleInputChange}
                                className="custom-input"
                            />
                            {isFormChanged && (
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
                        />
                    </div>
                )}
                {currentTab === 'Settings' && (
                    <div>
                        <h2>Настройки</h2>
                        <p>В разработке...</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
};

export default Profile;