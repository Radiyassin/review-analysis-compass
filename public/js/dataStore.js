
// Global data store for sharing data between vanilla JS and React
class DataStore {
    constructor() {
        this.data = {};
        this.listeners = new Set();
    }

    setData(key, value) {
        console.log(`DataStore: Setting ${key}:`, value);
        this.data[key] = value;
        this.notifyListeners(key, value);
    }

    getData(key) {
        return this.data[key];
    }

    getAllData() {
        return { ...this.data };
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(key, value) {
        console.log(`DataStore: Notifying ${this.listeners.size} listeners about ${key}`);
        this.listeners.forEach(callback => {
            try {
                callback(key, value, this.getAllData());
            } catch (error) {
                console.error('DataStore: Error in listener:', error);
            }
        });
    }

    clear() {
        this.data = {};
        this.notifyListeners('clear', null);
    }
}

// Create global instance
window.dataStore = new DataStore();
console.log('DataStore initialized');
