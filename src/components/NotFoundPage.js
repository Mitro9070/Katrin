import imgNotFound from '../images/Page-Not-Found.svg'
import '../styles/NotFoundPage.css'

function NotFoundPage() {
    return (  
        <div className="not-found-page page-content">
            <img src={imgNotFound} alt="" className="not-found-img" />
        </div>
    );
}

export default NotFoundPage;