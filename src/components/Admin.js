// Импорт основных библиотек React и необходимых компонентов
import React, { useState, useEffect } from 'react';
// Импорт хука для навигации между страницами
import { useNavigate } from 'react-router-dom';
// Импорт функций для работы с базой данных Firebase
import { ref, get, remove } from 'firebase/database';
// Импорт конфигурации базы данных Firebase
import { database } from '../firebaseConfig';
// Импорт библиотеки для работы с куки
import Cookies from 'js-cookie';
// Импорт компонентов приложения
import Loader from './Loader'; // Компонент индикатора загрузки
import Footer from './Footer'; // Компонент нижнего колонтитула
import UserTableComponent from './UserTableComponent'; // Компонент таблицы пользователей
import AddEmployee from './AddEmployee'; // Импорт компонента для добавления сотрудника

// Импорт изображений для использования в интерфейсе
import imgFilterIcon from '../images/filter.svg';
import imgAddPersonIcon from '../images/add-person.png';
import imgFilterSortIcon from '../images/filter-sort.png';

// Импорт стилей для компонента Admin и общих стилей страницы контента
import '../styles/Admin.css';
import '../styles/ContentPage.css';

// Объявление функционального компонента Admin
const Admin = () => {
    // Состояния для хранения списка пользователей, ролей, офисов и статуса загрузки
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState({});
    const [offices, setOffices] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Состояние для управления текущей вкладкой ("Сотрудники" или "Добавить сотрудника")
    const [currentTab, setCurrentTab] = useState('Employees');
    // Получение идентификатора пользователя и роли из куки
    const userId = Cookies.get('userId');
    const roleId = Cookies.get('roleId');
    // Инициализация навигации
    const navigate = useNavigate();

    // Функция для обновления списка пользователей после добавления или удаления
    const refreshUsers = async () => {
        try {
            // Ссылка на раздел "Users" в базе данных Firebase
            const usersRef = ref(database, 'Users');
            // Получение снимка данных пользователей
            const usersSnapshot = await get(usersRef);
            const usersArr = [];
            // Проверка наличия данных и формирование массива пользователей
            if (usersSnapshot.exists()) {
                usersSnapshot.forEach(childSnapshot => {
                    const user = childSnapshot.val();
                    usersArr.push({ ...user, id: childSnapshot.key });
                });
            }
            // Обновление состояния пользователей
            setUsers(usersArr);
        } catch (err) {
            console.error('Ошибка при обновлении данных пользователей:', err);
        }
    };

    // Хук useEffect для первоначальной загрузки данных при монтировании компонента
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Проверка авторизации пользователя и его роли (только администратор имеет доступ)
                if (!userId || roleId !== '1') {
                    navigate('/');
                    return;
                }

                // Ссылки на разделы базы данных Firebase
                const usersRef = ref(database, 'Users');
                const rolesRef = ref(database, 'Roles');
                const officesRef = ref(database, 'Offices');

                // Параллельное получение данных из нескольких разделов базы данных
                const [usersSnapshot, rolesSnapshot, officesSnapshot] = await Promise.all([get(usersRef), get(rolesRef), get(officesRef)]);
                
                const usersArr = [];
                // Формирование массива пользователей
                if (usersSnapshot.exists()) {
                    usersSnapshot.forEach(childSnapshot => {
                        const user = childSnapshot.val();
                        usersArr.push({ ...user, id: childSnapshot.key });
                    });
                }

                // Получение данных ролей и офисов
                const rolesData = rolesSnapshot.exists() ? rolesSnapshot.val() : {};
                const officesData = officesSnapshot.exists() ? officesSnapshot.val() : {};

                // Установка полученных данных в соответствующие состояния
                setUsers(usersArr);
                setRoles(rolesData);
                setOffices(officesData);

            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                // Отключение индикатора загрузки после завершения запроса
                setLoading(false);
            }
        };

        // Вызов функции загрузки данных
        fetchData();
    }, [userId, roleId, navigate]);

    // Обработчик изменения текущей вкладки при клике на таб
    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
    };

    // Обработчик удаления пользователя
    const handleDeleteUser = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            try {
                // Ссылка на конкретного пользователя в базе данных
                const userRef = ref(database, `Users/${id}`);
                // Удаление пользователя из базы данных
                await remove(userRef);
                // Обновление состояния пользователей после удаления
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Ошибка при удалении пользователя:", error);
            }
        }
    };

    // Отображение индикатора загрузки или сообщения об ошибке при необходимости
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
                        {Object.keys(offices).length === 0 && <p>Офисы не найдены</p>}
                        {/* Отображение пользователей по офисам */}
                        {Object.keys(offices).map((officeId) => {
                            const officeUsers = users.filter(user => String(user.office) === officeId);
                            return (
                                <div key={officeId} className="office-section">
                                    {/* Название офиса */}
                                    <h2>Офис {offices[officeId]}</h2>
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

// Экспорт компонента Admin для использования в других местах приложения
export default Admin;