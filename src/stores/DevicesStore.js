import { makeAutoObservable } from "mobx";

class DevicesStore {
    Devices = [
        {
            title: 'M240T',
            tags: ['M240T', 'Принтер', 'МФУ'],
            elementType: 'МФУ',
            image: '',
            text: 'Модель M240 с основным лотком увеличенной емкости, поставляющимся в бизе и позволяющим загрузить целую пачку бумаги. В отличии от базовой модели может быть доукомплектована опциональным лотком. Для напольной установки требуется специальная тумба, для Т конфигурации.',
            parameters: {
                "Основной показатель": "Значение устройства 1"
            },
            postData: '15 Июня, 12:00',
            id: '1',
        }
    ]

    constructor(){
        makeAutoObservable(this)
    }

    getDevicesByType(type){
        return this.Devices.filter(e => e.elementType === type)
    }

    getDevicesById(id){
        return this.Devices.filter(e => e.id === id)[0]
    }
}

export const devicesStore = new DevicesStore()