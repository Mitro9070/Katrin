// src/components/Calendar/EventModal.js

import React, { useState, useEffect } from 'react';
import CustomCropper from '../CustomCropper';
import moment from 'moment-timezone';
import InputMask from 'react-input-mask';
import './styles/EventModal.css';
import { fetchUsers } from '../../Controller/UsersController';
import { addEvent } from '../../Controller/EventsController';
import { MentionsInput, Mention } from 'react-mentions';
import defaultStyle from './styles/MentionsStyles';

const EventModal = ({ onClose, onSave, initialData = {} }) => {
    const formatDateTimeLocal = (date) => {
        const localDate = moment(date).format('YYYY-MM-DDTHH:mm');
        return localDate;
    };

    const [title, setTitle] = useState('');
    const [eventType, setEventType] = useState('Внешнее событие');
    const [organizer, setOrganizer] = useState('');
    const [organizerPhone, setOrganizerPhone] = useState('');
    const [organizerEmail, setOrganizerEmail] = useState('');
    const [location, setLocation] = useState('');
    const [participants, setParticipants] = useState([]);
    const [coverImage, setCoverImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [announcementText, setAnnouncementText] = useState('');
    const [links, setLinks] = useState(['']);
    const [files, setFiles] = useState([]);
    const [startDateTime, setStartDateTime] = useState(initialData.start ? formatDateTimeLocal(initialData.start) : '');
    const [endDateTime, setEndDateTime] = useState(initialData.end ? formatDateTimeLocal(initialData.end) : '');
    const [participantsInput, setParticipantsInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [tags, setTags] = useState(''); // Состояние для тегов

    // Новые состояния для кроппера
    const [showCropper, setShowCropper] = useState(false);
    const [cropperImageSrc, setCropperImageSrc] = useState(null);
    const [isCoverImageCropping, setIsCoverImageCropping] = useState(false);
    const [additionalImageIndex, setAdditionalImageIndex] = useState(null);

    // Функция загрузки пользователей
    const loadUsers = async (query, callback) => {
        try {
            const users = await fetchUsers();
            const filteredUsers = users
                .filter(user => `${user.name} ${user.surname}`.toLowerCase().includes(query.toLowerCase()))
                .map(user => ({ id: user.id, display: `${user.name} ${user.surname}` }));
            callback(filteredUsers);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    const parseParticipants = () => {
        const regex = /@\[(.+?)\]\((.+?)\)/g;
        const participantsList = [];
        let match;
        while ((match = regex.exec(participantsInput)) !== null) {
            participantsList.push({ id: match[2], name: match[1] });
        }
        return participantsList;
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropperImageSrc(reader.result);
                setIsCoverImageCropping(true);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setAdditionalImages(files);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropperImageSrc(reader.result);
                setIsCoverImageCropping(false);
                setAdditionalImageIndex(0);
                setShowCropper(true);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setCropperImageSrc(null);
        setIsCoverImageCropping(false);
        setAdditionalImageIndex(null);
    };

    const handleCropSave = (croppedBlob) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `cropped_image_${uniqueSuffix}.jpg`;
        const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });

        if (isCoverImageCropping) {
            // Для обложки события
            setCoverImage(croppedFile);
            setCoverImagePreview(URL.createObjectURL(croppedFile));

            // Закрываем кроппер и сбрасываем состояния
            handleCropCancel();
        } else if (additionalImageIndex !== null) {
            // Для дополнительных изображений
            const updatedImages = [...additionalImages];
            updatedImages[additionalImageIndex] = croppedFile;
            setAdditionalImages(updatedImages);

            const updatedPreviews = [...additionalImagesPreview];
            updatedPreviews[additionalImageIndex] = URL.createObjectURL(croppedFile);
            setAdditionalImagesPreview(updatedPreviews);

            // Проверяем, есть ли ещё изображения для обрезки
            const nextIndex = additionalImageIndex + 1;
            if (nextIndex < additionalImages.length) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCropperImageSrc(reader.result);
                    setAdditionalImageIndex(nextIndex);
                };
                reader.readAsDataURL(additionalImages[nextIndex]);
            } else {
                // Завершаем обрезку дополнительных изображений
                handleCropCancel();
            }
        } else {
            // На случай, если ни одно из условий не выполнено
            handleCropCancel();
        }
    };

    const handleAddLinkField = () => {
        setLinks([...links, '']);
    };

    const handleSave = async () => {
        // Проверка обязательных полей
        if (!title || !startDateTime || !endDateTime) {
            alert('Пожалуйста, заполните обязательные поля.');
            return;
        }

        // Создаём объекты moment из введённых пользователем дат и времени
        const startDate = moment(startDateTime, 'YYYY-MM-DDTHH:mm');
        const endDate = moment(endDateTime, 'YYYY-MM-DDTHH:mm');

        // Проверяем корректность дат
        if (!startDate.isValid() || !endDate.isValid()) {
            alert('Неверный формат даты и времени.');
            return;
        }

        // Преобразуем даты в строку без преобразования в UTC
        const startDateString = startDate.format('YYYY-MM-DDTHH:mm:ss');
        const endDateString = endDate.format('YYYY-MM-DDTHH:mm:ss');

        // Формируем данные для отправки
        const formData = new FormData();
        formData.append('title', title);
        formData.append('elementtype', eventType);
        formData.append('organizer', organizer);
        formData.append('organizerphone', organizerPhone);
        formData.append('organizeremail', organizerEmail);
        formData.append('start_date', startDateString);
        formData.append('end_date', endDateString);
        formData.append('location', location);
        formData.append('text', announcementText);

        // Парсинг участников
        const participantsList = parseParticipants();

        // Участники
        if (participantsList.length > 0) {
            formData.append('participants', JSON.stringify(participantsList.map(p => p.id)));
        }

        // Преобразуем теги из строки в массив
        const tagsArray = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        // Теги
        if (tagsArray.length > 0) {
            formData.append('tags', JSON.stringify(tagsArray));
        }

        // Обложка события
        if (coverImage) {
            formData.append('images', coverImage, coverImage.name);
        }

        // Дополнительные изображения
        additionalImages.forEach((image) => {
            formData.append('images', image, image.name);
        });

        // Ссылки
        if (links.length > 0) {
            formData.append('links', JSON.stringify(links));
        }

        // Файлы
        files.forEach((file) => {
            formData.append('files', file, file.name);
        });

        try {
            // Используем метод addEvent для сохранения события
            const newEvent = await addEvent(formData);
            onSave(newEvent); // Передаем событие обратно в родительский компонент
        } catch (error) {
            console.error('Ошибка при сохранении события:', error);
            alert('Произошла ошибка при сохранении события.');
        }
    };

    return (
        <>
            {showCropper && cropperImageSrc ? (
                <div className="cropper-modal">
                    <div className="cropper-modal-content">
                        <CustomCropper
                            imageSrc={cropperImageSrc}
                            onCancel={handleCropCancel}
                            onSave={handleCropSave}
                        />
                    </div>
                </div>
            ) : (
                <div className="modal">
                    <div className="modal-content event-modal">
                        <h2>Создать событие</h2>
                        <label>
                            Название события <span className="required">*</span>:
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Тип события:
                            <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                            >
                                <option value="Внешнее событие">Внешнее событие</option>
                                <option value="Внутреннее событие">Внутреннее событие</option>
                            </select>
                        </label>
                        <label>
                            Организатор мероприятия:
                            <input
                                type="text"
                                value={organizer}
                                onChange={(e) => setOrganizer(e.target.value)}
                            />
                        </label>
                        <label>
                            Телефон организатора:
                            <InputMask
                                mask="+7 (999) 999-99-99"
                                value={organizerPhone}
                                onChange={(e) => setOrganizerPhone(e.target.value)}
                            >
                                {(inputProps) => <input {...inputProps} type="tel" />}
                            </InputMask>
                        </label>
                        <label>
                            Email организатора:
                            <input
                                type="email"
                                value={organizerEmail}
                                onChange={(e) => setOrganizerEmail(e.target.value)}
                            />
                        </label>
                        <label>
                            Время начала <span className="required">*</span>:
                            <input
                                type="datetime-local"
                                value={startDateTime}
                                onChange={(e) => setStartDateTime(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Время окончания <span className="required">*</span>:
                            <input
                                type="datetime-local"
                                value={endDateTime}
                                onChange={(e) => setEndDateTime(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Место проведения:
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            {/* TODO: Добавить выбор переговорки из списка после указания времени */}
                        </label>
                        <label>
                            Пригласить участников:
                            <MentionsInput
                                value={participantsInput}
                                onChange={(e, newValue) => setParticipantsInput(newValue)}
                                style={defaultStyle}
                                placeholder="Введите @ для выбора пользователя"
                            >
                                <Mention
                                    trigger="@"
                                    data={loadUsers}
                                    markup="@[__display__](__id__)"
                                    displayTransform={(id, display) => `@${display}`}
                                />
                            </MentionsInput>
                        </label>
                        <label>
                            Обложка события:
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverImageChange}
                            />
                            {coverImagePreview && (
                                <img
                                    src={coverImagePreview}
                                    alt="Обложка события"
                                    className="image-preview"
                                />
                            )}
                        </label>
                        <label>
                            Дополнительные изображения:
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalImagesChange}
                            />
                            <div className="image-preview-container">
                                {additionalImagesPreview.map((src, index) => (
                                    <img
                                        key={index}
                                        src={src}
                                        alt={`Дополнительное изображение ${index + 1}`}
                                        className="image-preview"
                                    />
                                ))}
                            </div>
                        </label>
                        <label>
                            Текст анонса события:
                            <textarea
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                            />
                        </label>
                        <label>
                            Ссылки:
                            {links.map((link, index) => (
                                <input
                                    key={index}
                                    type="url"
                                    value={link}
                                    onChange={(e) => {
                                        const newLinks = [...links];
                                        newLinks[index] = e.target.value;
                                        setLinks(newLinks);
                                    }}
                                />
                            ))}
                            <button onClick={handleAddLinkField}>Добавить ссылку</button>
                        </label>
                        <label>
                            Прикрепить файлы:
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFiles(Array.from(e.target.files))}
                            />
                            <ul className="file-list">
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </label>
                        <label>
                            Теги:
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Введите теги, разделенные запятыми"
                            />
                        </label>
                        <div className="modal-buttons">
                            <button onClick={onClose}>Отмена</button>
                            <button onClick={handleSave}>Создать событие</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventModal;