import '../styles/MainPageBlockList.css'
import imgSettingsIcon from '../images/settings.svg'

function MainPageBlockList({name, list, plug=true}) {

    let content = list.map((element, index) => (
        <div className="content-block-list-row">
            <p className={`block-list-content-title ${index>0 ? "block-list-content-title-nofirst" : ""}`}>{element.title}</p>
            <p className="block-list-content-subtitle">{element.subtitle}</p>
            <p className="block-list-content-description">{element.description}</p>
        </div>
    ));

    return (
        <div className="block-list">
            <div className="wrapper">
                <div className="content">
                    {!plug && content}
                    {plug && (
                        <div className="block-list-plug">
                            <img src={imgSettingsIcon} alt="" />
                            <p>Блок в разработке</p>
                        </div>
                    )}
                </div>
            </div>
            <p className="name-block-list">{name}</p>
        </div>
     );
}

export default MainPageBlockList;