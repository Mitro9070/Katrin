import { useState } from 'react';

import '../styles/CustomCheckbox.css'

import checkmark from '../images/checkmark.svg'

function CustomCheckbox({name='', initialChecked=false, placeholder, onChange, value, defaultValue=''}) {

    const [isChecked, setIsChecked] = useState(initialChecked);

    const handleChange = () => {
        setIsChecked(!isChecked);
        onChange && onChange()
    };

    return ( 
        <label className="custom-checkbox noselect">
            <input type="checkbox" checked={isChecked} name={name} id="first" onChange={handleChange} value={value} defaultValue={defaultValue}/>
            <img src={checkmark} alt="" />
            <span>{placeholder}</span>
        </label>
     );
}

export default CustomCheckbox;