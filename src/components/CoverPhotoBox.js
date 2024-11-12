import React, { useState, useRef } from 'react';
import '../styles/PhotoSlider.css'; // Используем стили PhotoSlider

import imgAddIcon from '../images/add.svg';
import imgTrashIcon from '../images/trash.svg';

function CoverPhotoBox({ id = '', defaultValue = '' }) {
    const [ImagePath, setImagePath] = useState(defaultValue);
    const fileInputRef = useRef(null);

    const onChangeHandler = (e) => {
        if (e.target.files[0]) {
            const file = URL.createObjectURL(e.target.files[0]);
            setImagePath(file);
        }
    };

    const onDeleteHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.value = '';
        setImagePath('');
    };

    const onInputClickHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    return (
        <div className="photo-slider-item" onClick={onInputClickHandler}>
            <input
                ref={fileInputRef}
                type="file"
                onChange={onChangeHandler}
                accept='image/*'
                style={{ display: 'none' }}
                id={id}
            />
            {ImagePath ? (
                <>
                    <img className="photo-slider-photo" src={ImagePath} alt="" />
                    <div className="icon-container photo-slider-delete-container" onClick={onDeleteHandler}>
                        <img src={imgTrashIcon} alt="" className="photo-slider-delete" />
                    </div>
                </>
            ) : (
                <div className="photo-slider-add">
                    <img src={imgAddIcon} alt="Добавить фото" />
                </div>
            )}
        </div>
    );
}

export default CoverPhotoBox;