import { useState, useRef } from 'react';
import { storage } from '../firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import '../styles/CustomPhotoBox.css';

import imgAddIcon from '../images/add.svg';
import imgTrashIcon from '../images/edit.png';

function CustomPhotoBox({ name = '', id = '', defaultValue = '' }) {
    const [ImagePath, setImagePath] = useState(defaultValue ? defaultValue : '');
    const [ignoreNextClick, setIgnoreNextClick] = useState(false);

    const fileInputRef = useRef(null);

    const onChangeHandler = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const fileRef = storageRef(storage, `images/${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setImagePath(url);
            localStorage.setItem(file.name, url);
        }
    };

    const onDeleteHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.value = '';
        setImagePath('');
        setIgnoreNextClick(true);
    };

    const onInputClickHandler = (e) => {
        e.stopPropagation();
        ignoreNextClick && setIgnoreNextClick(false);
        !ignoreNextClick && fileInputRef.current.click();
    };

    return (
        <label className="custom-photobox-container">
            <input
                ref={fileInputRef}
                type="file"
                onChange={onChangeHandler}
                accept='image/*'
                onClick={onInputClickHandler}
                style={{ display: ImagePath ? 'none' : 'block' }}
                id={id}
                name={name}
            />
            <img className="custom-photobox-selected-photo" src={ImagePath} alt="" />
            <img className={`custom-photobox-icon ${ImagePath ? 'custom-photobox-icon-selected' : ''}`} src={imgAddIcon} alt="" />
            {ImagePath && (
                <div className="icon-container bid-image-delete-container" onClick={onDeleteHandler}>
                    <img src={imgTrashIcon} alt="" className="bid-image-delete" />
                </div>
            )}
        </label>
    );
}

export default CustomPhotoBox;