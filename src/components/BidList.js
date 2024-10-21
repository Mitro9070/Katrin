import '../styles/BidList.css'

import { observer } from 'mobx-react-lite';
import { bidContentStore } from '../stores/BidContentStore';
import BidListCard from './BidListCard';

const BidList = observer(({typeBid, typeList='Relevant'}) => {
    let bidAllow
    let bidDisallow
    let bidWait

    let bidAllowArchive
    let bidDisallowArchive

    if (typeList === 'Relevant'){
        bidAllow = bidContentStore.getWithStatus(typeBid, 'Одобрено').map((e) => {
            return <BidListCard status={e.status} title={e.title} text={e.text} publicDate={e.postData} eventType={e?.eventType} id={e.id} image={e.image[0]}/>
        })

        bidDisallow = bidContentStore.getWithStatus(typeBid, 'Отклонено').map((e) => {
            return <BidListCard status={e.status} title={e.title} text={e.text} publicDate={e.postData} eventType={e?.eventType} id={e.id} image={e.image[0]}/>
        })

        bidWait = bidContentStore.getWithStatus(typeBid, 'В процессе').map((e) => {
            return <BidListCard status={e.status} title={e.title} text={e.text} publicDate={e.postData} eventType={e?.eventType} id={e.id} image={e.image[0]}/>
        })
    }

    if (typeList === 'Archive'){
        bidAllowArchive = bidContentStore.getWithStatus(typeBid, 'Архив одобренных').map((e) => {
            return <BidListCard status={e.status} title={e.title} text={e.text} publicDate={e.postData} eventType={e?.eventType} id={e.id} image={e.image[0]}/>
        })

        bidDisallowArchive = bidContentStore.getWithStatus(typeBid, 'Архив отклоненных').map((e) => {
            return <BidListCard status={e.status} title={e.title} text={e.text} publicDate={e.postData} eventType={e?.eventType} id={e.id} image={e.image[0]}/>
        })
    }

    // Проверка на наличие заявок в зависимости от typeBid
    const hasBids =
        (typeBid === 'News' && bidContentStore.NewsBids.length > 0) ||
        (typeBid === 'Events' && bidContentStore.EventsBids.length > 0);


    return ( 
        <div className="bid-list-conatainer">
            {typeList === 'Relevant' && (
                <>
                    { hasBids ? (
                        <>
                            <p className="bid-tab-title">В процессе рассмотрения</p>
                            {bidWait.length > 0 ? bidWait : 'Нет заявок'}
                            <p className="bid-tab-title">Опубликованные заявки</p>
                            {bidAllow.length > 0 ? bidAllow : 'Нет заявок'}
                            <p className="bid-tab-title">Отклоненные заявки</p>
                            {bidDisallow.length > 0 ? bidDisallow : 'Нет заявок'}
                        </>
                    ) : (
                        <p className="bid-tab-title">Вы еще не отправляли заявки на {typeBid === 'News' ? 'новости' : 'события'}</p>
                    )}
                </>    
            )}
            {typeList === 'Archive' && (
                <>
                    <p className="bid-tab-title">Архив опубликованных</p>
                    {bidAllowArchive.length > 0 ? bidAllowArchive : 'Нет заявок'}
                    <p className="bid-tab-title">Архив отмененных</p>
                    {bidDisallowArchive.length > 0 ? bidDisallowArchive : 'Нет заявок'}
                </>
            )}
        </div>
     );
})

export default BidList;