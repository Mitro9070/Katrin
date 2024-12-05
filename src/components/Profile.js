import React, { useState, useEffect } from 'react';
import { ref as databaseRef, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebaseConfig';
import { createPortal } from 'react-dom';
import CustomCropper from './CustomCropper';
import Cookies from 'js-cookie';
import Loader from './Loader';
import Footer from './Footer';
import '../styles/Profile.css';
import { useParams } from 'react-router-dom';

const Profile = () => {
    const { userId } = useParams();
    const currentUserId = Cookies.get('userId');
    const [currentTab, setCurrentTab] = useState('PersonalData');
    const [loading, setLoading] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false); 
    const [userData, setUserData] = useState({});
    const [roleName, setRoleName] = useState('');
    const [offices, setOffices] = useState({});
    const [inputData, setInputData] = useState({});
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        console.log("Profile userId:", userId); 
        const fetchData = async () => {
            try {
                const userRef = databaseRef(database, `Users/${userId}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    setUserData(userData);
                    setInputData(userData);
                    setImageUrl(userData.image || null); 

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
            [name]: value,
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
                image: imageUrl,
            });
            setUserData(inputData);
            setIsFormChanged(false);
        } catch (err) {
            console.error('Error saving user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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
   
      const handleCropSave = async (croppedBlob) => {
        setShowCropper(false);
        setImageSrc(null);
        setLoadingImage(true);
        try {
          const imgRef = storageRef(storage, `employee-photos/${userId}.jpg`);
          await uploadBytes(imgRef, croppedBlob);
          const url = await getDownloadURL(imgRef);
          setImageUrl(url);
          setIsFormChanged(true);
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setLoadingImage(false);
        }
      };


    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
    };

    if (loading) return <Loader />;

    const isCurrentUser = currentUserId === userId;

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
                                readOnly={!isCurrentUser}
                            />
                            <label>Имя</label>
                            <input
                                type="text"
                                name="Name"
                                value={inputData.Name || ''}
                                onChange={handleInputChange}
                                className={`custom-input ${!inputData.Name && 'input-error'}`}
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
                                className={`custom-input ${!inputData.office && 'input-error'}`}
                                disabled={!isCurrentUser}
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

const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
};

export default Profile;