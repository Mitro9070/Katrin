import React from 'react';
import '../styles/CustomSelect.css';
import imgSelectIcon from '../images/select-open-down.svg';

function CustomSelect({ optionsList, width = '300px', name = '', id = '' }) {
    const Options = optionsList.map((e, index) => (
        <option 
            key={index} // Добавляем ключ для каждого элемента
            value={e.value} 
            disabled={index === 0} 
            selected={index === 0}
            style={{ fontWeight: 400 }}
        >
            {e.name}
        </option>
    ));

    const onChangeSelect = (e) => {
        e.target.value && e.target.classList.add('custom-select-selected');
    };

    return (
        <div className='custom-select-container' style={{ width }}>
            <select className='custom-select custom-input' onChange={onChangeSelect} name={name} id={id}>
                {Options}
            </select>
            <div className="icon-container custom-input-logo">
                <img src={imgSelectIcon} alt="" className="" />
            </div>
        </div>
    );
}

export default CustomSelect;