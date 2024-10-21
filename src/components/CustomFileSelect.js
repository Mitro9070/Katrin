import { useState, useRef } from 'react';

import '../styles/CustomFileSelect.css'

import imgAddIcon from '../images/add.svg'
import imgEyeIcon from '../images/folder.svg'
import imgTrashIcon from '../images/trash.svg'

function CustomFileSelect({name='', id='', defaultValue=''}) {
    const [FilePath, setFilePath] = useState(defaultValue);
    const [FileName, setFileName] = useState(defaultValue.split('\\').slice(-1));
    const [ignoreNextClick, setIgnoreNextClick] = useState(false);

    const fileInputRef = useRef(null);

    const onChangeHandler = (e) => {
        if (e.target.files[0]){
            setFileName(() => e.target.files[0].name)
            setFilePath(() => URL.createObjectURL(e.target.files[0]))
            console.log(FilePath)
        }    
    }

    const onDeleteHandler = (e) => {
        e.stopPropagation();
        fileInputRef.current.value = ''
        setFilePath(() => '')
        setIgnoreNextClick(() => true)
    }

    const onInputClickHandler = (e) => {
        e.stopPropagation();
        ignoreNextClick && setIgnoreNextClick(() => false)
        !ignoreNextClick && fileInputRef.current.click()
    }
    return (
        <div className="custom-fileselect">
            <label className="custom-photobox-container custom-fileselect-container" style={{background: FilePath?'#F2F3F4':'white'}}>
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    onChange={onChangeHandler}
                    onClick={onInputClickHandler}
                    style={{display: FilePath?'none':'block'}}
                    name={name}
                    id={id}
                />
                {/* <img className="custom-photobox-selected-photo" src={FilePath} alt="" /> */}
                <img className={`custom-photobox-icon ${FilePath ? 'custom-photobox-icon-selected' : ''}`} src={imgAddIcon} alt="" />
                {FilePath && (
                    <div className="icons-fileselect-container">
                        <div className="icon-container bid-file-delete-container">
                            <img src={imgEyeIcon} alt="" className="bid-image-show"/>
                        </div>
                        <div className="icon-container bid-file-delete-container" onClick={onDeleteHandler}>
                            <img src={imgTrashIcon} alt="" className="bid-image-delete"/>
                        </div>
                    </div>
                )}
            </label>
            {FileName && (
                <p className='custom-fileselect-filename'>{FileName}</p>
            )}
        </div>
     );
}

export default CustomFileSelect;