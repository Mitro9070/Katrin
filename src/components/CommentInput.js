import '../styles/CommentInput.css';

function CommentInput({ placeholder, onBlur }) {
    return (
        <div className='comment-input-container'>
            <textarea
                className="comment-input"
                placeholder={placeholder}
                onBlur={onBlur}
            />
        </div>
    );
}

export default CommentInput;