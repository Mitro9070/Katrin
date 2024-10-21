import '../styles/CustomInput.css'

function CustomInput({type="text", width='408px', placeholder, img, name='', id='', defaultValue=''}) {
    if (type == "date" && defaultValue) {
        defaultValue = new Date(defaultValue).toISOString().split('T')[0];
    }
    return (
        <div className='custom-input-container' style={{width: width}}>
            <input type={type}  className="custom-input" placeholder={placeholder} name={name} id={id} defaultValue={defaultValue}/>
            {img && (
                <div className="icon-container custom-input-logo">
                    <img src={img} alt="" className="" />
                </div>
            )}
        </div>
    );
}

export default CustomInput;