// src/stores/EventsStore.js
import { makeAutoObservable, runInAction } from "mobx";
import { database, storage } from "../firebaseConfig";
import { ref, get, set, push, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

class EventsStore {
    Events = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchData(); // Вызов метода получения данных при инициализации
    }

    async fetchData() {
        this.loading = true;
        try {
            const eventsRef = ref(database, 'Events');
            const snapshot = await get(eventsRef);

            runInAction(() => {
                // Здесь происходит распределение данных
                this.Events = [];
                console.log("Полученные данные из Firebase:", snapshot.val());

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        console.log("Элемент:", item);
                        const dateStringEvent = new Date(item.start_date);
                        const dateStringPost = new Date(item.created_at);
                        const months = {1: "января", 2: "февраля", 3: "марта", 4: "апреля", 5: "мая", 6: "июня", 7: "июля", 8: "августа", 9: "сентября", 10: "октября", 11: "ноября", 12: "декабря"};
                        this.Events.push({
                            title: item.title,
                            text: item.text,
                            image: item.image,
                            status: item.status,
                            postData: `${dateStringPost.getDate()} ${months[dateStringPost.getMonth() + 1]}`, //${dateStringPost.getFullYear()}
                            comment: '',
                            elementType: item.elementType,
                            id: childSnapshot.key,
                            eventType: item.elementType,
                            tags: item.tags.split(', '),
                            files: item.files,
                            links: item.links,
                            organizer: item.organizer,
                            organizer_email: item.organizer_email,
                            organizer_phone: item.organizer_phone,
                            place: item.place,
                            eventDate: item.eventDate, // Оставляем как есть, если это строка
                            created_at: item.created_at,
                            start_date: item.start_date,
                            end_date: item.end_date,
                        });
                    });
                } else {
                    console.log("Данные отсутствуют.");
                }

                console.log("Сформированный массив событий:", this.Events);
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                console.error("Ошибка при получении данных:", error);
                this.loading = false;
            });
        }
    }

    getEventsByType(type){
        return this.Events.filter(e => e.elementType === type)
    }

    getEventsById(id){
        return this.Events.filter(e => e.id == id)[0]
    }

    getEventsByDate(date){
        console.log('was getting')
        return this.Events.filter(e => e.eventDate === date)
    }

    getEventsDates(){
        let EventsDatesList = {external: [], internal: []}
        this.Events.forEach(e => {
            if (e.elementType === 'Внешнее событие') {
                EventsDatesList.external.push(e.eventDate)
            } else {
                EventsDatesList.internal.push(e.eventDate)
            }
        })

        return EventsDatesList
    }

    getEventsByDates(startDate, endDate) {
        return this.Events.filter(e => {
            const eventDate = new Date(e.start_date);
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
        });
    }

    async addNewEvent(data) {
        const newEventRef = push(ref(database, 'Events'));
        const newEventKey = newEventRef.key;

        const uploadFiles = async (files, folder) => {
            const urls = [];
            for (const file of files) {
                const fileRef = storageRef(storage, `${folder}/${newEventKey}/${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                urls.push(url);
            }
            return urls;
        };

        const photosUrls = await uploadFiles(data.image, 'events/photos');
        const filesUrls = await uploadFiles(data.files, 'events/files');

        const newEventData = {
            ...data,
            photos: photosUrls,
            files: filesUrls,
        };

        await set(newEventRef, newEventData);
    }

    async updateEvent(id, data) {
        const eventRef = ref(database, `Events/${id}`);

        const uploadFiles = async (files, folder) => {
            const urls = [];
            for (const file of files) {
                const fileRef = storageRef(storage, `${folder}/${id}/${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                urls.push(url);
            }
            return urls;
        };

        const photosUrls = await uploadFiles(data.image, 'events/photos');
        const filesUrls = await uploadFiles(data.files, 'events/files');

        const updatedEventData = {
            ...data,
            photos: photosUrls,
            files: filesUrls,
        };

        await update(eventRef, updatedEventData);
    }
}

export const eventsStore = new EventsStore();