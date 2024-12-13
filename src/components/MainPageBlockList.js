import '../styles/MainPageBlockList.css';
import imgSettingsIcon from '../images/settings.svg';
import { formatBirthday, formatNewEmployee } from '../utils/formatDate';
import { useNavigate } from 'react-router-dom';

function MainPageBlockList({ name, list, isBirthday }) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const navigate = useNavigate();

    const formatDatePart = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    };

    const todayPart = formatDatePart(today);
    const tomorrowPart = formatDatePart(tomorrow);

    console.log("Today's date part:", todayPart);
    console.log("Tomorrow's date part:", tomorrowPart);

    list.sort((a, b) => {
        const dateA = isBirthday ? formatBirthday(a.birthday) : new Date(a.createdAt);
        const dateB = isBirthday ? formatBirthday(b.birthday) : new Date(b.createdAt);
        const dateAPart = formatDatePart(dateA);
        const dateBPart = formatDatePart(dateB);

        console.log("Comparing dates:", dateAPart, dateBPart);

        if (dateAPart === todayPart) return -1;
        if (dateBPart === todayPart) return 1;
        if (dateAPart === tomorrowPart) return -1;
        if (dateBPart === tomorrowPart) return 1;

        return dateA - dateB;
    });

    const handleClick = (userId) => {
        if (!userId) {
            console.error(`User id not available for navigation`);
            return;
        }
        console.log(`Navigating to profile of user with id: ${userId}`);
        navigate(`/profile/${userId}`);
    };

    const content = list.map((element, index) => {
        let displayDate;
        if (isBirthday) {
            const birthday = formatBirthday(element.birthday);
            const birthdayPart = formatDatePart(birthday);

            console.log("Processing birthday:", birthdayPart);

            if (birthdayPart === todayPart) {
                displayDate = 'Сегодня';
            } else if (birthdayPart === tomorrowPart) {
                displayDate = 'Завтра';
            } else {
                displayDate = birthday.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
            }
        } else {
            displayDate = formatNewEmployee(element.createdAt);
        }

        console.log(`Rendering element with id: ${element.id} and name: ${element.name}`);

        return (
            <div className="content-block-list-row" key={index} onClick={() => handleClick(element.id)}>
                <p className={`block-list-content-title ${index > 0 ? "block-list-content-title-nofirst" : ""}`}>{displayDate}</p>
                <p className="block-list-content-subtitle">{`${element.surname} ${element.name} ${element.lastname}`}</p>
                <p className="block-list-content-description">{element.position}</p>
            </div>
        );
    });

    return (
        <div className="block-list">
            <div className="wrapper">
                <div className="content">
                    {content.length > 0 ? content : (
                        <div className="block-list-plug">
                            <img src={imgSettingsIcon} alt="settings icon" />
                            
                        </div>
                    )}
                </div>
            </div>
            <p className="name-block-list">{name}</p>
        </div>
    );
}

export default MainPageBlockList;