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

    // Функция для преобразования раскладки клавиатуры (русская <-> английская)
    const convertLayout = (str) => {
        const ruToEn = {
            'ё': '`', 'Ё': '~', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
            '6': '6', '7': '7', '8': '8', '9': '9', '0': '0', '-': '-', '=': '=',
            'й': 'q', 'Й': 'Q', 'ц': 'w', 'Ц': 'W', 'у': 'e', 'У': 'E', 'к': 'r',
            'К': 'R', 'е': 't', 'Е': 'T', 'н': 'y', 'Н': 'Y', 'г': 'u', 'Г': 'U',
            'ш': 'i', 'Ш': 'I', 'щ': 'o', 'Щ': 'O', 'з': 'p', 'З': 'P', 'х': '[',
            'Х': '{', 'ъ': ']', 'Ъ': '}', 'ф': 'a', 'Ф': 'A', 'ы': 's', 'Ы': 'S',
            'в': 'd', 'В': 'D', 'а': 'f', 'А': 'F', 'п': 'g', 'П': 'G', 'р': 'h',
            'Р': 'H', 'о': 'j', 'О': 'J', 'л': 'k', 'Л': 'K', 'д': 'l', 'Д': 'L',
            'ж': ';', 'Ж': ':', 'э': '\'', 'Э': '"', 'я': 'z', 'Я': 'Z', 'ч': 'x',
            'Ч': 'X', 'с': 'c', 'С': 'C', 'м': 'v', 'М': 'V', 'и': 'b', 'И': 'B',
            'т': 'n', 'Т': 'N', 'ь': 'm', 'Ь': 'M', 'б': ',', 'Б': '<', 'ю': '.',
            'Ю': '>', '.': '/', ',': '?', ' ': ' '
        };

        let res = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (ruToEn[char]) {
                res += ruToEn[char];
            } else {
                res += char;
            }
        }
        return res;
    };

    // Синонимы для поиска
    const synonyms = {
        // Синонимы для параметра "wifi"
        'wifi': ['wi-fi', 'wi fi', 'вайфай'],

        // Синонимы для моделей устройств
        'm133': ['m133', 'м133', 'm-133', 'м-133', 'm 133', 'м 133', 'хрень'],
        'm140': ['m140', 'м140', 'm-140', 'м-140', 'm 140', 'м 140'],
        'm240': ['m240', 'м240', 'm-240', 'м-240', 'm 240', 'м 240'],
        'm247e': ['m247e', 'м247е', 'm-247e', 'м-247е', 'm 247e', 'м 247е'],
        'm325': ['m325', 'м325', 'm-325', 'м-325', 'm 325', 'м 325'],
        'm348': ['m348', 'м348', 'm-348', 'м-348', 'm 348', 'м 348'],
        'm350': ['m350', 'м350', 'm-350', 'м-350', 'm 350', 'м 350'],

        // Синонимы для марок (марок)
        'катюша': ['катюша', 'katyusha'],

        // Синонимы для типа устройства
        'мфу': ['мфу', 'mfu'],

        // Синонимы для картриджей (например, 'TK133')
        'tk133': ['tk133', 'тк133', 'tk-133', 'тк-133'],
        'dr133': ['dr133', 'др133', 'dr-133', 'др-133'],
        'tk133c': ['tk133c', 'тк133c', 'tk-133c', 'тк-133c'],
        'tk133e': ['tk133e', 'тк133e', 'tk-133e', 'тк-133e'],

        // Синонимы для опций установки
        'cbm130p': ['cbm130p', 'сbm130p', 'cbm-130p', 'сbm-130p'],
        'bmm240': ['bmm240', 'bmm-240']
    };

    // Функция для нормализации строк с заменой синонимов
    const normalizeString = (str) => {
        let normalizedStr = str
            .toLowerCase()
            .replace(/[\s\-]/g, ''); // Удаляем пробелы и дефисы

        // Заменяем синонимы на базовые слова
        Object.keys(synonyms).forEach((key) => {
            synonyms[key].forEach((synonym) => {
                synonym = synonym.replace(/[\s\-]/g, '');
                if (normalizedStr.includes(synonym)) {
                    normalizedStr = normalizedStr.replace(synonym, key);
                }
            });
        });

        return normalizedStr;
    };

    // Функция для проверки совпадений с учетом раскладки и нормализации
    const checkMatch = (text, query) => {
        if (!text || !query) return false;

        const normalizedText = normalizeString(text);
        const normalizedQuery = normalizeString(query);

        const convertedQuery = convertLayout(normalizedQuery);
        const convertedText = convertLayout(normalizedText);

        return (
            normalizedText.includes(normalizedQuery) ||
            normalizedText.includes(convertedQuery) ||
            convertedText.includes(normalizedQuery)
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
        let searchResults = [];
        const normalizedQuery = searchQuery.toLowerCase();
        const normalizedQueryNoSpace = normalizedQuery.replace(/[\s\-]/g, '');

        // Выделяем числа и буквы из запроса
        const numberPattern = /\d+/g;
        const letterPattern = /[a-zа-яё]/i;

        const numbersInQuery = normalizedQueryNoSpace.match(numberPattern);
        const lettersInQuery = normalizedQueryNoSpace.match(letterPattern);

        const firstLetter = lettersInQuery ? lettersInQuery[0] : '';

        // Функция для назначения приоритета результатам
        const assignPriority = (itemTitle) => {
            let priority = 0;

            const normalizedTitle = normalizeString(itemTitle);
            const convertedTitle = convertLayout(normalizedTitle);

            // Проверяем наличие чисел
            if (numbersInQuery) {
                const numbersInTitle = normalizedTitle.match(numberPattern) || [];
                const convertedNumbersInTitle = convertedTitle.match(numberPattern) || [];

                const hasAllNumbers = numbersInQuery.every(num =>
                    numbersInTitle.includes(num) || convertedNumbersInTitle.includes(num)
                );

                if (hasAllNumbers) {
                    priority += 2; // Приоритет за совпадение чисел
                }
            }

            // Проверяем первую букву
            if (firstLetter) {
                const firstLetterInTitle = normalizedTitle.charAt(0);
                const firstLetterInConvertedTitle = convertedTitle.charAt(0);

                // Учитываем кириллицу и латиницу
                const lettersMatch = firstLetterInTitle === firstLetter ||
                    firstLetterInConvertedTitle === firstLetter ||
                    firstLetterInTitle === convertLayout(firstLetter) ||
                    firstLetterInConvertedTitle === convertLayout(firstLetter);

                if (lettersMatch) {
                    priority += 1; // Приоритет за совпадение первой буквы
                }
            }

            return priority;
        };

        // Функция для поиска в данных
        const searchInData = (dataObj, type) => {
            Object.keys(dataObj).forEach((id) => {
                const item = dataObj[id];

                // Получаем название элемента в зависимости от типа
                let title = '';
                let text = '';
                let options = '';
                let tags = '';

                if (type === 'Сотрудник') {
                    title = `${item.Name} ${item.surname} ${item.lastname}` || '';
                } else if (type === 'Устройство') {
                    title = id; // ID устройства как его модель
                    text = item.description || '';
                    if (item.options) {
                        if (typeof item.options === 'object') {
                            if (item.options.all && typeof item.options.all === 'object') {
                                options = Object.values(item.options.all).join(' ');
                            } else {
                                options = Object.values(item.options).join(' ');
                            }
                        } else if (typeof item.options === 'string') {
                            options = item.options;
                        }
                    }
                } else if (type === 'Новость' || type === 'Событие') {
                    title = item.title || '';
                    text = item.text || '';
                    if (item.tags) {
                        if (Array.isArray(item.tags)) {
                            tags = item.tags.join(' ');
                        } else if (typeof item.tags === 'string') {
                            tags = item.tags;
                        }
                    }
                }

                const fullText = `${title} ${text} ${options} ${tags}`.toLowerCase();

                if (checkMatch(fullText, normalizedQuery)) {
                    const priority = assignPriority(title);

                    searchResults.push({
                        type: type,
                        title: title,
                        id: id,
                        priority: priority
                    });
                }
            });
        };

        // Поиск в данных
        searchInData(usersData, 'Сотрудник');
        searchInData(devicesData, 'Устройство');
        searchInData(newsData, 'Новость');
        searchInData(eventsData, 'Событие');

        // Сортировка результатов по приоритету
        searchResults.sort((a, b) => b.priority - a.priority);

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