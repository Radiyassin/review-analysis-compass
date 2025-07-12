
// Main application entry point
console.log('Loading main application...');

// Create global dataStore immediately - this MUST be first
if (!window.dataStore) {
    // Inline DataStore class to ensure it's available immediately
    class DataStore {
        constructor() {
            this.data = {};
            this.listeners = new Set();
            this.isReady = true;
            console.log('DataStore: Created and ready');
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
    }

    window.dataStore = new DataStore();
    console.log('DataStore initialized and available globally');
}

// Prevent multiple initializations
if (window.mainAppLoaded) {
    console.log('Main app already loaded, skipping...');
} else {
    window.mainAppLoaded = true;
    
    // Load required modules
    const scripts = ['/js/api.js'];

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`Script ${src} already loaded`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    // Load scripts
    Promise.all(scripts.map(loadScript))
        .then(() => {
            console.log('All modules loaded successfully');
        })
        .catch(error => {
            console.error('Failed to load modules:', error);
        });

    // Main analyze function - REMOVED ALL DOM MANIPULATION
    window.analyze = async function() {
        console.log('🚀 === ANALYZE FUNCTION CALLED ===');
        
        const selectedFile = window.selectedCsvFile;
        if (!selectedFile) {
            alert('Please select a CSV file first!');
            return;
        }

        console.log('📁 Selected file:', selectedFile.name, 'Size:', selectedFile.size);

        try {
            console.log('📡 Starting API call...');
            const data = await ApiService.uploadFile(selectedFile);
            console.log('✅ API call completed successfully');
            console.log('📊 Received data structure:', Object.keys(data));

            if (!data.success && !data.chart_data) {
                throw new Error('Invalid response from server');
            }

            console.log('💾 === STORING DATA IN DATASTORE ===');
            
            // Store all data in the centralized data store
            if (window.dataStore) {
                console.log('🗄️ DataStore found, storing analysis results...');
                
                window.dataStore.setData('sentimentScore', data.sentiment_score || 0);
                window.dataStore.setData('salesTrend', data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' });
                window.dataStore.setData('productInfo', data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' });
                window.dataStore.setData('chartData', data.chart_data || {});
                window.dataStore.setData('commonPhrases', data.common_phrases || []);
                window.dataStore.setData('analysisComplete', true);
                
                console.log('🔍 === FINAL DATASTORE CONTENTS ===');
                const allData = window.dataStore.getAllData();
                console.log('Complete data store contents:', allData);
            } else {
                console.error('❌ DataStore not found!');
            }

            // Dispatch custom event for React components
            console.log('📢 Dispatching analysisCompleted event...');
            const event = new CustomEvent('analysisCompleted', { 
                detail: data,
                bubbles: true
            });
            window.dispatchEvent(event);
            console.log('✅ Event dispatched successfully');

            console.log('🎉 === ANALYSIS PROCESS COMPLETED SUCCESSFULLY ===');
            
        } catch (error) {
            console.error('💥 Analysis failed:', error);
            alert(`Analysis failed: ${error.message}`);
            if (window.dataStore) {
                window.dataStore.setData('analysisComplete', false);
            }
        }
    };

    console.log('🚀 Main application loaded and ready');
}
