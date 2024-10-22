import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { bidContentStore } from "../stores/BidContentStore";
import StandartCard from "./StandartCard";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const EventsPage = observer(() => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await bidContentStore.fetchEvents();
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <Loader />;

    const events = bidContentStore.getEvents();

    return (
        <div className="page-content events-page">
            <div className="events-page-content">
                {events.map(event => (
                    <Link to={`/events/${event.id}`} key={event.id}>
                        <StandartCard
                            title={event.title}
                            text={event.text}
                            publicDate={event.postData}
                            image={event.images[0]}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
});

export default EventsPage;