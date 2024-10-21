import StandartCard from "./StandartCard";
import { Link } from 'react-router-dom';
import { useState } from "react";

import '../styles/BidListCard.css'

import imgOpenDownIcon from '../images/select-open-down.svg'
import imgAllowIcon from '../images/checkmark.svg'
import imgDeclineIcon from '../images/cross.svg'
import imgEditIcon from '../images/edit.svg'
import imgArchiveIcon from '../images/archive.svg'

import BidCommentField from "./BidCommentField";
import { bidContentStore } from "../stores/BidContentStore";

function BidListCard({status, eventType, publicDate, title, text, image, id, admin}) {

    const [IsCommentOpen, setIsCommentOpen] = useState(false);

    const openCloseCommentHandler = () => {
        setIsCommentOpen(!IsCommentOpen)
    }

    return (
        <div className="bid-list-card">
            <Link to={`/bid/${eventType ? 'events' : 'news'}/${id}`}><StandartCard status={status} eventType={eventType} publicDate={publicDate} title={title} text={text} image={image}/></Link>
            <div className="comment-btn noselect" onClick={openCloseCommentHandler}>
                <div className="icon-container">
                    <img src={imgOpenDownIcon} alt="" style={{transform: IsCommentOpen?'rotate(180deg)':''}}/>
                </div>
                <p>Комментарии</p>
            </div>
            {status === 'В процессе' && (
                <>
                    <div className="bid-btn-allow noselect" onClick={() => bidContentStore.approveBid(id)}>
                        <img src={imgAllowIcon} alt="" />
                        <p>Опубликовать</p>
                    </div>
                    <div className="bid-btn-decline noselect" onClick={() => bidContentStore.declineBid(id)}>
                        <img src={imgDeclineIcon} alt="" />
                        <p>Отменить</p>
                    </div>
                </>
            )}
            <Link to={`/bid/edit/${eventType ? 'events' : 'news'}/${id}`}>
                <div className="icon-container icon-container-edit-bid">
                    <img src={imgEditIcon} alt="" />
                </div>
            </Link>
            
            {(status === "Одобрено" || status === 'Отклонено') && (
                <div className="icon-container icon-container-edit-bid" onClick={() => bidContentStore.toArchive(id)}>
                    <img src={imgArchiveIcon} alt="" />
                </div>
            )}

            {IsCommentOpen && (
               <BidCommentField /> 
            )}
        </div>
        
    );
}

export default BidListCard;