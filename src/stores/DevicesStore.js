import { makeAutoObservable } from "mobx";
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

class DevicesStore {
    Devices = [];
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
                if (!roleData.permissions.devicepage) {
                    throw new Error('У вас недостаточно прав для просмотра устройств');
                }
            } else {
                throw new Error('Роль не найдена');
            }

            const devicesRef = ref(database, 'Devices');
            const snapshot = await get(devicesRef);
            if (snapshot.exists()) {
                const devicesData = [];
                snapshot.forEach(childSnapshot => {
                    const device = childSnapshot.val();
                    devicesData.push({
                        id: childSnapshot.key,
                        ...device
                    });
                });
                this.Devices = devicesData;
            }
        } catch (error) {
            console.error('Ошибка при загрузке устройств:', error);
        } finally {
            this.loading = false;
        }
    }

    getDevicesByType(type) {
        return this.Devices.filter(e => e.elementType === type);
    }

    getDevicesById(id) {
        return this.Devices.filter(e => e.id === id)[0];
    }
}

export const devicesStore = new DevicesStore();