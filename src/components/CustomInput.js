import '../styles/CustomInput.css';

function CustomInput({
  type = "text",
  width = '408px',
  placeholder,
  img,
  name = '',
  id = '',
  value,
  onChange,
}) {
  return (
    <div className='custom-input-container' style={{ width: width }}>
      <input
        type={type}
        className="custom-input"
        placeholder={placeholder}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
      />
      {img && (
        <div className="icon-container custom-input-logo">
          <img src={img} alt="" className="" />
        </div>
      )}
    </div>
  );
}

export default CustomInput;