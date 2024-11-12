import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import Loader from './Loader';
import Footer from './Footer';
import UserTableComponent from './UserTableComponent'; 

import imgFilterIcon from '../images/filter.svg';
import imgAddPersonIcon from '../images/add-person.png';
import imgFilterSortIcon from '../images/filter-sort.png';

import '../styles/Admin.css'; // Импорт стилей
import '../styles/ContentPage.css'; // Импорт стилей из ContentPage

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState({});
    const [offices, setOffices] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState('Employees');
    const userId = Cookies.get('userId');
    const roleId = Cookies.get('roleId');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId || roleId !== '1') {
                    navigate('/');
                    return;
                }

                const usersRef = ref(database, 'Users');
                const rolesRef = ref(database, 'Roles');
                const officesRef = ref(database, 'Offices');

                const [usersSnapshot, rolesSnapshot, officesSnapshot] = await Promise.all([get(usersRef), get(rolesRef), get(officesRef)]);
                
                const usersArr = [];
                if (usersSnapshot.exists()) {
                    usersSnapshot.forEach(childSnapshot => {
                        const user = childSnapshot.val();
                        usersArr.push({ ...user, id: childSnapshot.key });
                    });
                }

                const rolesData = rolesSnapshot.exists() ? rolesSnapshot.val() : {};
                const officesData = officesSnapshot.exists() ? officesSnapshot.val() : {};

                setUsers(usersArr);
                setRoles(rolesData);
                setOffices(officesData);

            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, roleId, navigate]);

    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
    };

    const handleEditUser = (id) => {
        // Логика редактирования пользователя
        // Следует добавить логику редактирования здесь
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            try {
                const userRef = ref(database, `Users/${id}`);
                await remove(userRef);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Ошибка при удалении пользователя:", error);
            }
        }
    };

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="content-page page-content">
            <div className="content-page-head noselect">
                <p className={`content-page-head-tab ${currentTab === 'Employees' ? 'content-page-head-tab-selected' : ''}`} data-tab="Employees" onClick={changeCurrentTabHandler}>Сотрудники</p>
                <p className={`content-page-head-tab ${currentTab === 'AddEmployee' ? 'content-page-head-tab-selected' : ''}`} data-tab="AddEmployee" onClick={changeCurrentTabHandler}>Добавить сотрудника</p>
                <div className="content-page-btn-add" style={{ marginLeft: 'auto' }}>
                    <img src={imgAddPersonIcon} alt="Создать роль" style={{ marginRight: '10px' }} />
                    <p>Создать роль</p>
                </div>
            </div>
            <div className="content-page-head-2 noselect">
                <div className="filter">
                    <img src={imgFilterIcon} alt="filter" />
                    <p className="filter-text">Фильтр</p>
                </div>
                <div className="sort" style={{ marginLeft: '30px' }}>
                    <img src={imgFilterSortIcon} alt="Сортировка" />
                    <p className="filter-text">Сортировка</p>
                </div>
            </div>
            <div className="content-page-content">
                {currentTab === 'Employees' && (
                    <>
                        {Object.keys(offices).length === 0 && <p>Отделы не найдены</p>}
                        {Object.keys(offices).map((officeId) => {
                            const officeUsers = users.filter(user => String(user.office) === officeId);
                            return (
                                <div key={officeId} className="office-section">
                                    <h2>Офис {offices[officeId]}</h2>
                                    {officeUsers.length > 0 ? (
                                        <UserTableComponent 
                                            users={officeUsers} 
                                            roles={roles} 
                                            onEditUser={handleEditUser} 
                                            onDeleteUser={handleDeleteUser} 
                                        />
                                    ) : (
                                        <p>Нет сотрудников</p>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
                {currentTab === 'AddEmployee' && (
                    <div>
                        {/* Add employee form goes here */}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Admin;