// src/stores/BidContentStore.js
import { makeAutoObservable, runInAction } from "mobx";
import { database, storage } from "../firebaseConfig";
import { ref, get, set, push, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

class BidContentStore {
    NewsBids = [];
    EventsBids = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchData(); // Вызов метода получения данных при инициализации
    }

    async fetchData() {
        this.loading = true;
        try {
            const applicationsRef = ref(database, 'applications');
            const snapshot = await get(applicationsRef);

            runInAction(() => {
                // Здесь происходит распределение данных
                this.NewsBids = [];
                this.EventsBids = [];

                snapshot.forEach((childSnapshot) => {
                    const item = childSnapshot.val();
                    console.log(item.formats[0])
                    // Допустим, есть поле "eventType", по которому мы определяем тип записи
                    if (['Внутреннее событие', 'Внешнее событие'].includes(item.formats[0])) {
                        this.EventsBids.push({
                            title: item.title,
                            text: item.text,
                            image: item.photos,
                            status: item.status,
                            postData: item.created_at,
                            comment: '',
                            elementType: item.formats,
                            id: childSnapshot.key,
                            eventType: 'Мероприятие',
                            tags: item.tags,
                            files: item.files,
                            links: item.links,
                            organizer: item.organizer,
                            organizer_email: item.organizer_email,
                            organizer_phone: item.organizer_phone,
                            place: item.place,
                            start_date: item.start_date,
                            end_date: item.end_date,
                        }); // Если это мероприятие
                    } else {
                        this.NewsBids.push({
                            title: item.title,
                            text: item.text,
                            image: item.photos,
                            status: item.status,
                            postData: item.created_at,
                            comment: '',
                            elementType: item.formats,
                            id: childSnapshot.key,
                            tags: item.tags,
                            files: item.files,
                            links: item.links,
                            fixed: item.fixed,
                            display_up_to: item.display_up_to,
                        });  // Если это новость
                    }
                });

                this.loading = false;

                console.log(this.NewsBids)
                console.log(this.EventsBids)
            });
        } catch (error) {
            runInAction(() => {
                console.error("Ошибка при получении данных:", error);
                this.loading = false;
            });
        }
    }

    getBidsArray(typeBids) {
        if (['News', 'news'].includes(typeBids)) {
            return this.NewsBids;
        } else if (['Events', 'events'].includes(typeBids)) {
            return this.EventsBids;
        }
    }

    getWithStatus(typeBids, status) {
        let bid = this.getBidsArray(typeBids);
        return bid.filter(e => e.status === status);
    }

    getWithId(typeBids, id) {
        let bid = this.getBidsArray(typeBids);
        console.log(id)
        console.log(bid[0].id)
        return bid.filter(e => e.id == id);
    }

    getWithIdAll(id) {
        return this.NewsBids.filter(e => e.id == id) && this.EventsBids.filter(e => e.id == id);
    }

    setNewStatus(typeBids, id, status) {
        let bid = this.getBidsArray(typeBids);
        bid.forEach((e, index, arr) => {
            if (e.id === id) {
                arr[index].status = status;
            }
        });
    }

    async addNewBid(data){
        console.log(data)
        const newBidRef = push(ref(database, 'applications'));
        const newBidKey = newBidRef.key;

        const uploadFiles = async (files, folder) => {
            const urls = [];
            for (const file of files) {
                const fileRef = storageRef(storage, `${folder}/${newBidKey}/${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                urls.push(url);
            }
            return urls;
        };

        const photosUrls = await uploadFiles(data.image, 'applications/photos');
        const filesUrls = await uploadFiles(data.files, 'applications/files');

        const newBidData = {
            ...data,
            photos: photosUrls,
            files: filesUrls,
        };

        await set(newBidRef, newBidData);
    }

    async updateBid(id, data) {
        console.log(data)
        const bidRef = ref(database, `applications/${id}`);

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

        const photosUrls = await uploadFiles(data.image, 'applications/photos');
        const filesUrls = await uploadFiles(data.files, 'applications/files');

        const updatedBidData = {
            ...data,
            photos: photosUrls,
            files: filesUrls,
        };

        await update(bidRef, updatedBidData);
    }

    async approveBid(id){
        const bidRef = ref(database, `applications/${id}`);
        await update(bidRef, { status: 'Одобрено' });
        window.location.reload();
    }

    async declineBid(id){
        const bidRef = ref(database, `applications/${id}`);
        await update(bidRef, { status: 'Отклонено' });
        window.location.reload();
    }

    async toArchive(id){
        const bidRef = ref(database, `applications/${id}`);
        const snapshot = await get(bidRef);
        const status = snapshot.val().status;

        const newStatus = status === 'Одобрено' ? 'Архив одобренных' : 'Архив отклоненных';
        await update(bidRef, { status: newStatus });
        window.location.reload();
    }
}

export const bidContentStore = new BidContentStore();