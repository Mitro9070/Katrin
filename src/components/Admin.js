// src/components/Admin.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUserByEmail } from '../Controller/UsersController';
import { fetchRoles } from '../Controller/RolesController';
import { fetchOffices } from '../Controller/OfficesController';
import Cookies from 'js-cookie';
import Loader from './Loader';
import Footer from './Footer';
import UserTableComponent from './UserTableComponent';
import AddEmployee from './AddEmployee';

// Импорт изображений для интерфейса
import imgFilterIcon from '../images/filter.svg';
import imgAddPersonIcon from '../images/add-person.png';
import imgFilterSortIcon from '../images/filter-sort.png';

// Импорт стилей
import '../styles/Admin.css';
import '../styles/ContentPage.css';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState('Employees');

    const userId = Cookies.get('userId');
    const roleId = Cookies.get('roleId');

    const navigate = useNavigate();

    const refreshUsers = async () => {
        try {
            const usersData = await fetchUsers();
            setUsers(usersData);
        } catch (err) {
            console.error('Ошибка при обновлении данных пользователей:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId || roleId !== '1') {
                    navigate('/');
                    return;
                }

                const [usersData, rolesData, officesData] = await Promise.all([
                    fetchUsers(),
                    fetchRoles(),
                    fetchOffices(),
                ]);

                setUsers(usersData);
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

    // Обработчик удаления пользователя
    const handleDeleteUser = async (email) => {
        if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            try {
                // Удаление пользователя через бэкенд по email
                await deleteUserByEmail(email);
                // Обновление состояния пользователей после удаления
                setUsers(users.filter(user => user.email !== email));
            } catch (error) {
                console.error("Ошибка при удалении пользователя:", error);
            }
        }
    };

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="content-page page-content">
            {/* Заголовок страницы с переключателями вкладок */}
            <div className="content-page-head noselect">
                {/* Вкладка "Сотрудники" */}
                <p
                    className={`content-page-head-tab ${currentTab === 'Employees' ? 'content-page-head-tab-selected' : ''}`}
                    data-tab="Employees"
                    onClick={changeCurrentTabHandler}
                >
                    Сотрудники
                </p>
                {/* Вкладка "Добавить сотрудника" */}
                <p
                    className={`content-page-head-tab ${currentTab === 'AddEmployee' ? 'content-page-head-tab-selected' : ''}`}
                    data-tab="AddEmployee"
                    onClick={changeCurrentTabHandler}
                >
                    Добавить сотрудника
                </p>
                {/* Кнопка "Создать роль" с иконкой */}
                <div className="content-page-btn-add" style={{ marginLeft: 'auto' }}>
                    <img src={imgAddPersonIcon} alt="Создать роль" style={{ marginRight: '10px' }} />
                    <p>Создать роль</p>
                </div>
            </div>
            {/* Дополнительные кнопки фильтрации и сортировки */}
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
            {/* Основной контент страницы */}
            <div className="content-page-content">
                {currentTab === 'Employees' && (
                    <>
                        {/* Проверка наличия офисов */}
                        {offices.length === 0 && <p>Офисы не найдены</p>}
                        {/* Отображение пользователей по офисам */}
                        {offices.map((office) => {
                            const officeUsers = users.filter(user => String(user.office) === String(office.id));
                            return (
                                <div key={office.id} className="office-section">
                                    {/* Название офиса */}
                                    <h2>{office.name_office}</h2>
                                    {/* Проверка наличия пользователей в офисе */}
                                    {officeUsers.length > 0 ? (
                                        // Компонент таблицы пользователей
                                        <UserTableComponent
                                            users={officeUsers}
                                            roles={roles}
                                            onDeleteUser={handleDeleteUser}
                                            refreshUsers={refreshUsers}
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
                    // Отображение компонента для добавления нового сотрудника
                    <AddEmployee offices={offices} roles={roles} refreshUsers={refreshUsers} />
                )}
            </div>
            {/* Компонент нижнего колонтитула */}
            <Footer />
        </div>
    );
};

export default Admin;