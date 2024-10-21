import React from 'react';
import '../styles/CustomInput.css'; // Используем существующий файл стилей

function CustomTextarea({ value, onChange, width = '408px', placeholder, name = '', id = '' }) {
    return (
        <div className='custom-input-container' style={{ width }}>
            <textarea
                className="custom-input custom-scrollbar"
                style={{ height: '87px', resize: 'none' }}
                placeholder={placeholder}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default CustomTextarea;