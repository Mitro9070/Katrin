// src/components/CustomPhotoBox.js

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CustomCropper from './CustomCropper';
import '../styles/CustomPhotoBox.css';

import imgAddIcon from '../images/add.svg';
import imgTrashIcon from '../images/edit.png';

function CustomPhotoBox({ name = '', id = '', defaultValue = '', onFileSelect, index }) {
    const [imagePreview, setImagePreview] = useState(defaultValue ? defaultValue : '');
    const [showCropper, setShowCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    // Удаляем selectedFile, если он не используется
    // const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        setImagePreview(defaultValue || '');
    }, [defaultValue]);

    const onChangeHandler = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onDeleteHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.value = '';
        // setSelectedFile(null); // Если selectedFile не используется, можно удалить
        setImagePreview('');
        onFileSelect && onFileSelect(null, index); // Удаляем файл в родительском компоненте
    };

    const onInputClickHandler = (e) => {
        e.stopPropagation();
        if (!showCropper) {
            fileInputRef.current.click();
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
    };

    const handleCropSave = async (croppedBlob) => {
        setShowCropper(false);

        // Создаём объект URL для предварительного просмотра
        const croppedImageUrl = URL.createObjectURL(croppedBlob);
        setImagePreview(croppedImageUrl);
        // setSelectedFile(croppedBlob); // Можно удалить, если не используется

        // Передаём файл (Blob) в родительский компонент
        if (onFileSelect) {
            // Преобразуем Blob в File, чтобы сохранить оригинальное имя файла и тип
            const file = new File([croppedBlob], `cropped_${Date.now()}.jpg`, { type: croppedBlob.type });
            onFileSelect(file, index);
        }
    };

    return (
        <div className="custom-photobox-container-wrapper">
            <label className="custom-photobox-container">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onChangeHandler}
                    accept='image/*'
                    style={{ display: 'none' }}
                    id={id}
                    name={name}
                />
                {imagePreview ? (
                    <img
                        className="custom-photobox-selected-photo"
                        src={imagePreview}
                        alt=""
                        onClick={onInputClickHandler}
                    />
                ) : (
                    <div className="custom-photobox-placeholder" onClick={onInputClickHandler}>
                        <img className="custom-photobox-icon" src={imgAddIcon} alt="" />
                    </div>
                )}
                {imagePreview && (
                    <div className="icon-container bid-image-delete-container" onClick={onDeleteHandler}>
                        <img src={imgTrashIcon} alt="" className="bid-image-delete" />
                    </div>
                )}
            </label>
            {showCropper && createPortal(
                <CustomCropper
                    imageSrc={imageSrc}
                    onCancel={handleCropCancel}
                    onSave={handleCropSave}
                />,
                document.body
            )}
        </div>
    );
}

export default CustomPhotoBox;