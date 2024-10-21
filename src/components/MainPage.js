import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { mainPageStore } from '../stores/MainPageStore';
import { newsContentStore } from '../stores/NewsContentStore';

import '../styles/MainPage.css';
import MainPageBlockList from './MainPageBlockList';
import MainPageBlockSlide from './MainPageBlockSlide';

import photoNewsImg from '../images/photo-news.png';

import iconHintImg from '../images/hint-ring.svg';
import iconMainInImg from '../images/mail-in.svg';
import iconBatchImg from '../images/batch.svg';
import iconPencilImg from '../images/pencil.svg';
import EditMainMenuPush from './EditMainMenuPush';

import Footer from './Footer';
import MainPageBlockAds from './MainPageBlockAds';
import Loader from './Loader';
import QuestionPush from './QuestionPush';
import InitiativePush from './InitiativePush';

const MainPage = observer(() => {
    useEffect(() => {
        newsContentStore.fetchData();
    }, []);

    let name = "Имя";
    let info = [
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" },
        { title: "14 июня", subtitle: "Иван Иванов", description: "Менеджер по продажам г. Москва" }
    ];

    let name2 = "Новые сотрудники";
    let info2 = [
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" },
        { title: "Иван Иванов", subtitle: "Менеджер по продажам г. Москва" }
    ];

    let events = [
        { datatime: "Завтра, 12:00", description: "Создадим инновации вместе. Мы открыты к предложениям разработчиков, партнеров и дистрибьюторов", hashtage: "# открытие", eventType: "Внешнее мероприятие" },
        { datatime: "Завтра, 10:00", description: "Технологии будущего уже сегодня. Приглашаем разработчиков, стартапы и инвесторов на нашу презентацию новых продуктов.", hashtage: "# презентация", eventType: "Внешнее мероприятие" },
        { datатime: "Завтра, 16:00", description: "Время новых возможностей. Присоединяйтесь к нашему вебинару, где мы обсудим сотрудничество с перспективными разработчиками и партнерами.", hashtage: "# вебинар", eventType: "Онлайн мероприятие" }
    ];

    let news = [
        { datatime: "Сегодня, 12:00", title: "Создадим инновации вместе. Мы открыты к предложениям разработчиков, партнеров и дистрибьюторов, чтобы предлагать лучшие решения", description: "В частности, высокотехнологичная концепция общественного уклада требует определения и уточнения глубокомысленных рассуждений. Значимость этих проблем настолько очевидна, что курс на социально-ориентированный национальный проект предопределяет высокую востребованность распределения внутренних резервов и ресурсов! В частности, высокотехнологичная концепция общественного уклада требует определения и уточнения глубокомысленных рассуждений. Значимость этих проблем настолько очевидна, что курс на социально-ориентированный национальный проект предопределяет высокую востребованность распределения внутренних..." },
        { datatime: "Вчера, 18:45", title: "Новый этап развития компании: что ждет нас впереди", description: "Наша компания вступает в новый этап развития, ориентируясь на инновации и устойчивое развитие. Это требует пересмотра стратегических планов и активного привлечения новых партнеров. Впереди нас ждут новые проекты и амбициозные цели, которые позволят нам выйти на новый уровень и предложить нашим клиентам еще более качественные и современные решения." },
        { datatime: "Неделя назад, 09:30", title: "Внедрение новых технологий: первые результаты и перспективы", description: "Мы начали внедрение новейших технологий, которые уже приносят первые результаты. Наши специалисты активно работают над совершенствованием производственных процессов, что позволяет нам значительно увеличить эффективность и снизить затраты. В будущем мы планируем расширить использование этих технологий на все наши подразделения и достигнуть еще больших успехов." },
        { datатime: "Сегодня, 08:15", title: "Совместные проекты с международными партнерами: первые шаги", description: "Недавно мы заключили ряд соглашений с международными партнерами, что открывает для нас новые возможности для роста и развития. Первые шаги уже сделаны, и мы видим значительный потенциал в таких коллаборациях. Совместные проекты позволят нам обмениваться опытом и внедрять передовые решения, что укрепит наши позиции на рынке." },
        { datатime: "Три дня назад, 15:00", title: "Социальные инициативы компании: помощь обществу и экология", description: "Компания активно участвует в социальных инициативах, направленных на поддержку местных сообществ и охрану окружающей среды. Мы запустили несколько программ, которые уже получили положительные отклики от населения. Наши усилия направлены на создание устойчивого будущего и улучшение качества жизни людей, что является важной частью нашей корпоративной ответственности." }
    ];

    const [ShowEditMainMenuPush, setShowEditMainMenuPush] = useState(false);
    const [ShowQuestionPush, setShowQuestionPush] = useState(false);
    const [ShowInitiativePush, setShowInitiativePush] = useState(false);

    const setShowEditMainMenuPushHandler = () => {
        setShowEditMainMenuPush(() => !ShowEditMainMenuPush);
    };

    const setShowQuestionPushHandler = () => {
        setShowQuestionPush(() => !ShowQuestionPush);
    };

    const setShowInitiativePushHandler = () => {
        setShowInitiativePush(() => !ShowInitiativePush);
    };

    return (
        <div className="main-page page-content noselect">
            <div className="main-page-head">
                <p className="welcome-text">{`Добрый день, ${name}!`}</p>
                <img src={iconPencilImg} alt="" className="edit-main-page-img" onClick={() => setShowEditMainMenuPushHandler()} />
            </div>
            <div className="main-page-content">
                <MainPageBlockAds />
                {mainPageStore.NewsBlock.includes('News') && (
                    <MainPageBlockSlide name={'Новости'} data={news} photo={photoNewsImg} className="news" />
                )}
                {mainPageStore.NewsBlock.includes('Events') && (
                    <MainPageBlockSlide name={'События'} data={events} />
                )}
                {mainPageStore.NewsBlock.includes('Births') && (
                    <MainPageBlockList name={'Дни рождения'} list={info} />
                )}
                {mainPageStore.NewsBlock.includes('Personal') && (
                    <MainPageBlockList name={name2} list={info2} />
                )}
                {mainPageStore.NewsBlock.includes('Link1') && (
                    <div className="main-page-btn main-page-btn-red" onClick={setShowQuestionPushHandler}>
                        <img src={iconHintImg} alt="" />
                        <p>Задать вопрос</p>
                    </div>
                )}
                {mainPageStore.NewsBlock.includes('Link2') && (
                    <div className="main-page-btn" onClick={setShowInitiativePushHandler}>
                        <img src={iconMainInImg} alt="" />
                        <p>Предложить инициативу</p>
                    </div>
                )}
                {mainPageStore.NewsBlock.includes('Link3') && (
                    <a href={mainPageStore.Links[2]}><div className="main-page-btn">
                        <img src={iconBatchImg} alt="" />
                        <p>Пройти опрос</p>
                    </div></a>
                )}
            </div>
            {ShowEditMainMenuPush && (
                <EditMainMenuPush setShowEditMainMenuPush={setShowEditMainMenuPushHandler} />
            )}
            {ShowQuestionPush && (
                <QuestionPush setShowQuestionPush={setShowQuestionPushHandler} />
            )}
            {ShowInitiativePush && (
                <InitiativePush setShowInitiativePush={setShowInitiativePushHandler} />
            )}
            <Footer />
        </div>
    );
});

export default MainPage;