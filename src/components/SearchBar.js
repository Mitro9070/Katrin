import React, { useState, useEffect } from 'react';
import '../styles/SearchBar.css';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [devicesData, setDevicesData] = useState({});
    const [newsData, setNewsData] = useState({});
    const [eventsData, setEventsData] = useState({});
    const navigate = useNavigate();

    // Загрузка данных из базы данных при монтировании компонента
    useEffect(() => {
        // Загрузка пользователей
        const usersRef = ref(database, 'Users');
        get(usersRef).then((snapshot) => {
            if (snapshot.exists()) {
                setUsersData(snapshot.val());
            }
        });

        // Загрузка устройств
        const devicesRef = ref(database, 'Devices');
        get(devicesRef).then((snapshot) => {
            if (snapshot.exists()) {
                setDevicesData(snapshot.val());
            }
        });

        // Загрузка новостей
        const newsRef = ref(database, 'News');
        get(newsRef).then((snapshot) => {
            if (snapshot.exists()) {
                setNewsData(snapshot.val());
            }
        });

        // Загрузка событий
        const eventsRef = ref(database, 'Events');
        get(eventsRef).then((snapshot) => {
            if (snapshot.exists()) {
                setEventsData(snapshot.val());
            }
        });
    }, []);

    // Функция для преобразования раскладки
    const convertLayout = (str) => {
        const ru = 'ёйцукенгшщзхъфывапролджэячсмитьбю';
        const en = '`qwertyuiop[]asdfghjkl;\'zxcvbnm,.';
        let res = '';
        for (let i = 0; i < str.length; i++) {
            const index = ru.indexOf(str[i]);
            if (index !== -1) {
                res += en[index];
            } else {
                const indexEn = en.indexOf(str[i]);
                if (indexEn !== -1) {
                    res += ru[indexEn];
                } else {
                    res += str[i];
                }
            }
        }
        return res;
    };

    // Функция для проверки совпадений
    const checkMatch = (text, query) => {
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        return (
            textLower.includes(queryLower) ||
            textLower.includes(convertLayout(queryLower)) ||
            convertLayout(textLower).includes(queryLower)
        );
    };

    // Обработка изменения в поле ввода
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length > 0) {
            performSearch(value);
        } else {
            setResults([]);
        }
    };

    // Функция для выполнения поиска
    const performSearch = (searchQuery) => {
        const searchResults = [];
        const normalizedQuery = searchQuery.toLowerCase();

        // Поиск по пользователям
        Object.keys(usersData).forEach((userId) => {
            const user = usersData[userId];
            const fullName = `${user.Name} ${user.surname} ${user.lastname}`.toLowerCase();
            if (
                checkMatch(fullName, normalizedQuery) ||
                (user.email && user.email.toLowerCase().includes(normalizedQuery)) ||
                (user.position && user.position.toLowerCase().includes(normalizedQuery)) ||
                (user.phone && user.phone.toLowerCase().includes(normalizedQuery))
            ) {
                searchResults.push({
                    type: 'Сотрудник',
                    title: `${user.Name} ${user.surname}`,
                    id: userId
                });
            }
        });

 // Поиск по устройствам
Object.keys(devicesData).forEach((deviceId) => {
    const device = devicesData[deviceId];
    const model = deviceId.toLowerCase(); // Модель устройства (ID в БД)
    const description = device.description ? device.description.toLowerCase() : '';

    // Получаем опции устройства и преобразуем их в одну строку
    let options = '';
    if (device.options) {
        // Если options является объектом
        if (typeof device.options === 'object') {
            // Если есть вложенный объект 'all'
            if (device.options.all && typeof device.options.all === 'object') {
                options = Object.values(device.options.all).join(' ').toLowerCase();
            } else {
                // Если структура другая, объединяем все значения options
                options = Object.values(device.options).join(' ').toLowerCase();
            }
        } else if (typeof device.options === 'string') {
            // Если options это строка
            options = device.options.toLowerCase();
        }
    }

    // Проверяем совпадения с запросом
    if (
        checkMatch(model, normalizedQuery) ||
        checkMatch(description, normalizedQuery) ||
        checkMatch(options, normalizedQuery)
    ) {
        searchResults.push({
            type: 'Устройство',
            title: deviceId, // Можно добавить больше информации, если нужно
            id: deviceId
        });
    }
});

// Поиск по новостям
Object.keys(newsData).forEach((newsId) => {
    const newsItem = newsData[newsId];
    const title = newsItem.title ? newsItem.title.toLowerCase() : '';
    const text = newsItem.text ? newsItem.text.toLowerCase() : '';
    
    // Обработка tags
    let tags = '';
    if (newsItem.tags) {
        if (Array.isArray(newsItem.tags)) {
            // Если tags - массив, объединяем в строку
            tags = newsItem.tags.join(' ').toLowerCase();
        } else if (typeof newsItem.tags === 'string') {
            // Если tags - строка
            tags = newsItem.tags.toLowerCase();
        } else {
            // Иной тип данных
            tags = '';
        }
    }

    if (
        checkMatch(title, normalizedQuery) ||
        checkMatch(text, normalizedQuery) ||
        checkMatch(tags, normalizedQuery)
    ) {
        searchResults.push({
            type: 'Новость',
            title: newsItem.title,
            id: newsId
        });
    }
});

// Поиск по событиям
Object.keys(eventsData).forEach((eventId) => {
    const event = eventsData[eventId];
    const title = event.title ? event.title.toLowerCase() : '';
    const text = event.text ? event.text.toLowerCase() : '';
    
    // Обработка tags
    let tags = '';
    if (event.tags) {
        if (Array.isArray(event.tags)) {
            // Если tags - массив, объединяем в строку
            tags = event.tags.join(' ').toLowerCase();
        } else if (typeof event.tags === 'string') {
            // Если tags - строка
            tags = event.tags.toLowerCase();
        } else {
            // Иной тип данных
            tags = '';
        }
    }

    if (
        checkMatch(title, normalizedQuery) ||
        checkMatch(text, normalizedQuery) ||
        checkMatch(tags, normalizedQuery)
    ) {
        searchResults.push({
            type: 'Событие',
            title: event.title,
            id: eventId
        });
    }
});

// Обновляем состояние результатов поиска
setResults(searchResults);
};

// Обработчик клика по результату поиска
const handleResultClick = (result) => {
    if (result.type === 'Устройство') {
        navigate(`/devices/${result.id}`);
    } else if (result.type === 'Новость') {
        navigate(`/news/${result.id}`);
    } else if (result.type === 'Событие') {
        navigate(`/events/${result.id}`);
    } else if (result.type === 'Сотрудник') {
        navigate(`/profile/${result.id}`);
    }
    // Очищаем поисковый запрос и результаты
    setQuery('');
    setResults([]);
};

// Рендеринг компонента поиска
return (
    <div className="header-search">
        <input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={handleInputChange}
            className="header-search-input"
        />
        {results.length > 0 && (
            <div className="search-results">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className="search-result-item"
                        onClick={() => handleResultClick(result)}
                    >
                        <span className="result-type">{result.type}</span>: {result.title}
                    </div>
                ))}
            </div>
        )}
    </div>
);
}

export default SearchBar;