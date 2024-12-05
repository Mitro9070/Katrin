import React, { useState, useRef } from 'react';
import { storage } from '../firebaseConfig';
import { createPortal } from 'react-dom';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomCropper from './CustomCropper';
import '../styles/CustomPhotoBox.css';

import imgAddIcon from '../images/add.svg';
import imgTrashIcon from '../images/edit.png';

function CustomPhotoBox({ name = '', id = '', defaultValue = '', onImageUpload }) {
    const [imagePath, setImagePath] = useState(defaultValue ? defaultValue : '');
    const [imageSrc, setImageSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const fileInputRef = useRef(null);

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
        setImagePath('');
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

        const fileRef = storageRef(storage, `images/${new Date().getTime()}.jpg`);
        await uploadBytes(fileRef, croppedBlob);
        const url = await getDownloadURL(fileRef);

        setImagePath(url);

        // Передаем URL в родительский компонент
        if (onImageUpload) {
            onImageUpload(url);
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
                    onClick={onInputClickHandler}
                    style={{ display: 'none' }}
                    id={id}
                    name={name}
                />
                <img className="custom-photobox-selected-photo" src={imagePath} alt="" />
                <img className={`custom-photobox-icon ${imagePath ? 'custom-photobox-icon-selected' : ''}`} src={imgAddIcon} alt="" />
                {imagePath && (
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