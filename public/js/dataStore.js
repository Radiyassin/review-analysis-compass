
// Global data store for sharing data between vanilla JS and React
class DataStore {
    constructor() {
        this.data = {};
        this.listeners = new Set();
        this.isReady = false;
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
        console.log(`DataStore: Added listener, total: ${this.listeners.size}`);
        return () => {
            this.listeners.delete(callback);
            console.log(`DataStore: Removed listener, remaining: ${this.listeners.size}`);
        };
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

    markReady() {
        this.isReady = true;
        console.log('DataStore: Marked as ready');
    }
}

// Create global instance
if (!window.dataStore) {
    window.dataStore = new DataStore();
    console.log('DataStore initialized');
} else {
    console.log('DataStore already exists');
}
