function Footer() {
    return (
        <div style={{
            width: '1200px',
            display: 'grid',
            gridTemplateColumns: '33% 33% 33%',
            gridGap: '10px',
            fontSize: '12px',
            fontWeight: '500',
            padding: '20px',
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e5e5',
            position: 'static',
            bottom: '0',
            left: '5px',
            marginTop: '10px'
        }}>
            {/* Первая колонка футера */}
            <div style={{ textAlign: 'left', width: '100%' }}>
                <p>+7 (495) 120-11-25</p>
                <p>123112, Москва, Пресненская наб. 8, с.1</p>
                <p>Москва-Сити, МФК “Город Столиц”</p>
            </div>
           {/* Вторая колонка футера */}
           <div style={{ textAlign: 'left', width: '100%' }}>
                <p>Секретариат secretary@katusha-it.ru</p>
                <p>IT it@saturn-sw.ru</p>
                <p>Реклама PR@Katusha-it.ru</p>
            </div>
            {/* Третья колонка футера */}
            <div style={{ textAlign: 'left', width: '100%' }}>
                <p>Основной Telegram @katushait</p>
                <p>Поддержка @BestServiceKatushaIT</p>
                <p>YouTube Название</p>
            </div>
        </div>
    );
}

export default Footer;