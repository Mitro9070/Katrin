import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import './fonts/PFDinTextPro/stylesheet.css';
import Menu from './components/Menu';
import Header from './components/Header';
import MainPage from './components/MainPage';
import Footer from './components/Footer';
import AuthPush from './components/AuthPush';
import BidPage from './components/BidPage';
import NotFoundPage from './components/NotFoundPage';
import SingleBidPage from './components/SingleBidPage';
import NewsPage from './components/NewsPage';
import SingleNewsPage from './components/SingleNewsPage';
import DevicesPage from './components/DevicesPage';
import SingleDevicesPage from './components/SingleDevicesPage';
import Calendar from './components/Calendar';
import EventsPage from './components/EventsPage';
import SingleEventsPage from './components/SingleEventsPage';
import Readaktor from './components/Readaktor';
import CKEditorRedaktor from './components/CKEditor';
import EditBidPage from './components/EditBidPage';

function App() {
    const [ShowAuth, setShowAuth] = useState(false);

    const setShowAuthPush = (value) => {
        setShowAuth(() => value);
    };

    return (
        <div className="App">
            <Router>
                <Menu setShowAuthPush={setShowAuthPush} />
                <Header setShowAuthPush={setShowAuthPush} />
                <Routes>
                    <Route exact path='/' element={<MainPage />} />
                    <Route exact path='/news' element={<NewsPage />} />
                    <Route exact path='/news/:id' element={<SingleNewsPage />} />
                    <Route exact path='/devices' element={<DevicesPage />} />
                    <Route exact path='/devices/:id' element={<SingleDevicesPage />} />
                    <Route exact path='/software' element={<p className='plug'>Заглушка ПО</p>} />
                    <Route exact path='/events' element={<EventsPage />} />
                    <Route exact path='/events/:id' element={<SingleEventsPage />} />
                    <Route exact path='/map' element={<p className='plug'>Заглушка карты</p>} />
                    <Route exact path='/bid' element={<BidPage />} />
                    <Route exact path='/bid/edit/:typeForm/:id' element={<EditBidPage />} />
                    <Route exact path='/bid/:bidType/:id' element={<SingleBidPage />} />
                    <Route exact path='/red' element={<CKEditorRedaktor />} />
                    <Route exact path='/*' element={<NotFoundPage />} />
                </Routes>
                {ShowAuth && (
                    <AuthPush setShowAuthPush={setShowAuthPush} />
                )}
            </Router>
        </div>
    );
}

export default App;