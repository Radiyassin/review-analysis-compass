
// Main application entry point
console.log('Loading main application...');

// Create global dataStore immediately
if (!window.dataStore) {
    // Inline DataStore class to ensure it's available immediately
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

    window.dataStore = new DataStore();
    window.dataStore.markReady(); // Mark as ready immediately
    console.log('DataStore initialized and ready');
}

// Prevent multiple initializations
if (window.mainAppLoaded) {
    console.log('Main app already loaded, skipping...');
} else {
    window.mainAppLoaded = true;
    
    // Load all modules
    const scripts = [
        '/js/api.js',  
        '/js/charts.js',
        '/js/domUpdater.js',
        '/js/chatbot.js'
    ];

    let loadedScripts = 0;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
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
                loadedScripts++;
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    // Load all scripts and initialize
    Promise.all(scripts.map(loadScript))
        .then(() => {
            console.log('All modules loaded successfully');
            initialize();
        })
        .catch(error => {
            console.error('Failed to load modules:', error);
        });

    function initialize() {
        console.log('Initializing application...');
        
        // Initialize charts after a delay to ensure DOM is ready
        setTimeout(() => {
            if (window.ChartManager) {
                ChartManager.initialize();
            }
        }, 1000);
    }

    // Main analyze function
    window.analyze = async function() {
        console.log('=== ANALYZE FUNCTION CALLED ===');
        
        const selectedFile = window.selectedCsvFile;
        if (!selectedFile) {
            alert('Please select a CSV file first!');
            return;
        }

        console.log('Selected file:', selectedFile.name, 'Size:', selectedFile.size);
        
        // Show loading state with correct selector
        const analyzeBtn = document.querySelector('button[class*="bg-gradient-to-r"][class*="from-blue-600"]');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...';
        }

        try {
            // Upload and analyze file
            const data = await ApiService.uploadFile(selectedFile);

            if (!data.success && !data.chart_data) {
                throw new Error('Invalid response from server');
            }

            console.log('=== STORING DATA IN DATASTORE ===');
            console.log('Full data received:', data);
            
            // Store all data in the centralized data store
            if (window.dataStore) {
                window.dataStore.setData('sentimentScore', data.sentiment_score || 0);
                window.dataStore.setData('salesTrend', data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' });
                window.dataStore.setData('productInfo', data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' });
                window.dataStore.setData('chartData', data.chart_data || {});
                window.dataStore.setData('commonPhrases', data.common_phrases || []);
                window.dataStore.setData('analysisComplete', true);
                
                console.log('=== DATA STORED, CURRENT DATASTORE CONTENTS ===');
                console.log(window.dataStore.getAllData());
            }

            // Update DOM-based UI components
            if (window.DOMUpdater) {
                DOMUpdater.updateProductInfo(data.product_info || {});
                DOMUpdater.updatePhrases(data.common_phrases || []);
            }
            
            if (data.chart_data && window.ChartManager) {
                ChartManager.update(data.chart_data);
            }

            // Dispatch custom event for React components
            const event = new CustomEvent('analysisCompleted', { detail: data });
            window.dispatchEvent(event);

            console.log('=== ANALYSIS PROCESS COMPLETED ===');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            alert(`Analysis failed: ${error.message}`);
            if (window.dataStore) {
                window.dataStore.setData('analysisComplete', false);
            }
        } finally {
            // Reset button state
            const analyzeBtn = document.querySelector('button[class*="bg-gradient-to-r"][class*="from-blue-600"]');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>Analyze CSV';
            }
        }
    };

    console.log('Main application loaded');
}
