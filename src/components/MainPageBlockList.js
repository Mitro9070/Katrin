import '../styles/MainPageBlockList.css';
import imgSettingsIcon from '../images/settings.svg';
import { formatBirthday } from '../utils/formatDate';

function MainPageBlockList({ name, list, plug = false }) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDatePart = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    };

    const todayPart = formatDatePart(today);
    const tomorrowPart = formatDatePart(tomorrow);

    console.log("Today's date part:", todayPart);
    console.log("Tomorrow's date part:", tomorrowPart);

    // Сортируем список по дате
    list.sort((a, b) => {
        const dateAPart = formatDatePart(formatBirthday(a.birthday));
        const dateBPart = formatDatePart(formatBirthday(b.birthday));

        console.log("Comparing dates:", dateAPart, dateBPart);

        if (dateAPart === todayPart) return -1;
        if (dateBPart === todayPart) return 1;
        if (dateAPart === tomorrowPart) return -1;
        if (dateBPart === tomorrowPart) return 1;

        return new Date(a.birthday) - new Date(b.birthday);
    });

    let content = list.map((element, index) => {
        const birthday = formatBirthday(element.birthday);
        let displayDate = birthday.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

        const birthdayPart = formatDatePart(birthday);

        console.log("Processing birthday:", birthdayPart);

        if (birthdayPart === todayPart) {
            displayDate = 'Сегодня';
        } else if (birthdayPart === tomorrowPart) {
            displayDate = 'Завтра';
        }

        return (
            <div className="content-block-list-row" key={index}>
                <p className={`block-list-content-title ${index > 0 ? "block-list-content-title-nofirst" : ""}`}>{displayDate}</p>
                <p className="block-list-content-subtitle">{`${element.surname} ${element.name} ${element.lastname}`}</p>
                <p className="block-list-content-description">{element.position}</p>
                <div className="event-separator"></div>
            </div>
        );
    });

    return (
        <div className="block-list">
            <div className="wrapper">
                <div className="content">
                    {content.length > 0 ? content : (
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