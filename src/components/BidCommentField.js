import { useState, useRef } from "react";

import '../styles/BidCommentField.css'

function BidCommentField() {

    const [Comments, setComments] = useState(
        [
            {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
            // {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
            // {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
            // {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
            // {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
            // {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: 'Комментарий комментарий'},
        ]);

    const InputRef = useRef()

    const addCommentHandler = () => {
        let commentText = InputRef.current.value
        if (commentText) {
            setComments([...Comments, {from: 'Иванов Иван Иванович', postTime: '12:30 14.07.24', text: commentText}])
            InputRef.current.value = ''
        }
    }

    return ( 
        <div className="bid-comment-field">
            <div className="bid-comments-container">
                {Comments.map(e => (
                    <div className="bid-one-comment-row">
                        <div className="bid-one-comment-row-1">
                            <p>{e.from}</p>
                            <p>{e.postTime}</p>
                        </div>
                        <div className="bid-one-comment-row-2">
                            <p>{e.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="comments-input-container">
                <input ref={InputRef} type="text" placeholder="Введите комментарий"/>
                <div className="bid-send-comment-btn" onClick={addCommentHandler}>
                    <p>Отправить</p>
                </div>
            </div>
        </div>
     );
}

export default BidCommentField;