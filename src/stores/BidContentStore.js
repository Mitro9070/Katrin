import { makeAutoObservable, runInAction } from "mobx";
import { database } from "../firebaseConfig";
import { ref, get, update } from "firebase/database";
import { getAuth } from 'firebase/auth';
import Cookies from 'js-cookie';

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
            const auth = getAuth();
            const currentUser = auth.currentUser ? auth.currentUser.uid : Cookies.get('userId');
            let roleId = 2; // Default role ID for "Гость"

            if (currentUser) {
                const userRef = ref(database, `Users/${currentUser}`);
                const userSnapshot = await get(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    roleId = userData.role;
                }
            }

            const roleRef = ref(database, `Roles/${roleId}`);
            const roleSnapshot = await get(roleRef);
            if (roleSnapshot.exists()) {
                const roleData = roleSnapshot.val();
                if (!roleData.permissions.bidpage) {
                    throw new Error('У вас недостаточно прав для просмотра заявок');
                }
            } else {
                throw new Error('Роль не найдена');
            }

            const bidsRef = ref(database, 'Bids');
            const eventsRef = ref(database, 'Events');
            const [bidsSnapshot, eventsSnapshot] = await Promise.all([get(bidsRef), get(eventsRef)]);

            runInAction(() => {
                this.NewsBids = [];
                this.EventsBids = [];

                if (bidsSnapshot.exists()) {
                    bidsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if (['Внутреннее событие', 'Внешнее событие'].includes(item.elementType)) {
                            this.EventsBids.push({
                                ...item,
                                id: childSnapshot.key,
                                eventType: 'Мероприятие'
                            });
                        } else {
                            this.NewsBids.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        this.EventsBids.push({
                            ...item,
                            id: childSnapshot.key,
                            eventType: 'Мероприятие'
                        });
                    });
                }

                this.loading = false;
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
        return bid.filter(e => e.id === id);
    }

    getWithIdAll(id) {
        return this.NewsBids.filter(e => e.id === id) && this.EventsBids.filter(e => e.id === id);
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
        const formData = new FormData();
        data.title && formData.append("title", data.title);
        if (data.tags) {
            data.tags.forEach((tag) => {
                formData.append("tags", tag);
            });
        }
        data.elementType && formData.append("formats", data.elementType);
        data.text && formData.append("text", data.text);
        data.place && formData.append("place", data.place);
        data.start_date && formData.append("start_date", data.start_date);
        data.end_date && formData.append("end_date", data.end_date);
        data.organizer && formData.append("organizer", data.organizer);
        data.organizer_phone && formData.append("organizer_phone", data.organizer_phone);
        data.organizer_email && formData.append("organizer_email", data.organizer_email);
        data.status && formData.append("status", data.status);
        data.fixed && formData.append("fixed", data.fixed);
        data.display_up_to && formData.append("display_up_to", data.display_up_to);
        if (data.image) {
            data.image.forEach((photo) => {
                formData.append("photos", photo);
            });
        }
        if (data.files) {
            data.files.forEach((file) => {
                formData.append("files", file);
            });
        }
        if (data.links) {
            data.links.forEach((link) => {
                formData.append("links", link);
            });
        }

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/applications`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            console.log("Success:", result);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async updateBid(id, data) {
        const updates = {};
        updates[`/Events/${id}`] = data;

        try {
            await update(ref(database), updates);
            console.log("Success:", data);

            runInAction(() => {
                const index = this.NewsBids.findIndex(bid => bid.id === id);
                if (index !== -1) {
                    this.NewsBids[index] = { ...this.NewsBids[index], ...data };
                }

                const eventIndex = this.EventsBids.findIndex(bid => bid.id === id);
                if (eventIndex !== -1) {
                    this.EventsBids[eventIndex] = { ...this.EventsBids[eventIndex], ...data };
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async approveBid(id){
        try {
            const updates = {};
            updates[`/Events/${id}/status`] = 'Одобрено';
            await update(ref(database), updates);
            console.log("Заявка одобрена:", id);
        } catch (error) {
            console.error("Ошибка при одобрении заявки:", error);
        }
    }

    async declineBid(id){
        try {
            const updates = {};
            updates[`/Events/${id}/status`] = 'Отклонено';
            await update(ref(database), updates);
            console.log("Заявка отклонена:", id);
        } catch (error) {
            console.error("Ошибка при отклонении заявки:", error);
        }
    }

    async toArchive(id){
        try {
            const updates = {};
            updates[`/Events/${id}/status`] = 'Архив';
            await update(ref(database), updates);
            console.log("Заявка перемещена в архив:", id);
        } catch (error) {
            console.error("Ошибка при перемещении в архив:", error);
        }
    }
}

export const bidContentStore = new BidContentStore();