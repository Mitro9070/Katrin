// Импорт CSS стилей для футера
import '../styles/Footer.css';

function Footer() {
    return (
        <div className="footer">
            {/* Первая колонка футера */}
            <div className="column-footer">
                <p>+7 (495) 120-11-25</p>
                <p>123112, Москва, Пресненская наб. 8, с.1</p>
                <p>Москва-Сити, МФК “Город Столиц”</p>
            </div>
           {/* Вторая колонка футера */}
           <div className="center-column-footer">
                <p>Секретариат secretary@katusha-it.ru</p>
                <p>IT it@saturn-sw.ru</p>
                <p>Реклама PR@Katusha-it.ru</p>
            </div>
            {/* Третья колонка футера */}
            <div className="last-column-footer">
                <p>Основной Telegram @katushait</p>
                <p>Поддержка @BestServiceKatushaIT</p>
                <p>YouTube Название</p>
            </div>
        </div>
    );
}

export default Footer;