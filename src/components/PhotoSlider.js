import React, { useState, useRef } from 'react';
import '../styles/PhotoSlider.css';

import imgAddIcon from '../images/add.svg';
import imgTrashIcon from '../images/trash.svg';

function PhotoSlider({ defaultValues = [] }) {
    const [photos, setPhotos] = useState(defaultValues);
    const fileInputRef = useRef(null);

    const onChangeHandler = (e) => {
        if (e.target.files[0]) {
            const file = URL.createObjectURL(e.target.files[0]);
            setPhotos([...photos, file]);
        }
    };

    const onDeleteHandler = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const onInputClickHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    return (
        <div className="photo-slider">
            <div className="photo-slider-wrapper">
                {photos.map((photo, index) => (
                    <div key={index} className="photo-slider-item">
                        <img className="photo-slider-photo" src={photo} alt="" />
                        <div className="icon-container photo-slider-delete-container" onClick={() => onDeleteHandler(index)}>
                            <img src={imgTrashIcon} alt="" className="photo-slider-delete" />
                        </div>
                    </div>
                ))}
                <div className="photo-slider-add" onClick={onInputClickHandler}>
                    <img src={imgAddIcon} alt="Добавить фото" />
                </div>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                onChange={onChangeHandler}
                accept='image/*'
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default PhotoSlider;