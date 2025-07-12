
// Main application entry point
console.log('Loading main application...');

// Create global dataStore immediately - this MUST be first
if (!window.dataStore) {
    // Inline DataStore class to ensure it's available immediately
    class DataStore {
        constructor() {
            this.data = {};
            this.listeners = new Set();
            this.isReady = true; // Mark as ready immediately
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
        console.log('🚀 === ANALYZE FUNCTION CALLED ===');
        
        const selectedFile = window.selectedCsvFile;
        if (!selectedFile) {
            alert('Please select a CSV file first!');
            return;
        }

        console.log('📁 Selected file:', selectedFile.name, 'Size:', selectedFile.size);
        
        // Show loading state with multiple button selectors
        const buttonSelectors = [
            'button[class*="bg-gradient-to-r"][class*="from-blue-600"]',
            '.btn-blue',
            'button:has(svg)',
            'button[class*="Analyze"]',
            'button[disabled="false"]'
        ];
        
        let analyzeBtn = null;
        for (const selector of buttonSelectors) {
            analyzeBtn = document.querySelector(selector);
            if (analyzeBtn && analyzeBtn.textContent.includes('Analyze')) {
                console.log('🎯 Found analyze button with selector:', selector);
                break;
            }
        }
        
        if (analyzeBtn) {
            console.log('💫 Setting button to loading state...');
            analyzeBtn.disabled = true;
            const originalContent = analyzeBtn.innerHTML;
            analyzeBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...';
            console.log('✅ Button updated to loading state');
            
            // Store original content for reset
            analyzeBtn._originalContent = originalContent;
        } else {
            console.warn('⚠️ Analyze button not found with any selector!');
            console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => ({
                text: b.textContent,
                classes: b.className
            })));
        }

        try {
            console.log('📡 Starting API call...');
            const data = await ApiService.uploadFile(selectedFile);
            console.log('✅ API call completed successfully');
            console.log('📊 Received data structure:', Object.keys(data));
            console.log('📈 Full response data:', data);

            if (!data.success && !data.chart_data) {
                throw new Error('Invalid response from server');
            }

            console.log('💾 === STORING DATA IN DATASTORE ===');
            
            // Store all data in the centralized data store
            if (window.dataStore) {
                console.log('🗄️ DataStore found, storing analysis results...');
                
                // Log each piece of data being stored
                console.log('🌟 Storing sentiment score:', data.sentiment_score);
                window.dataStore.setData('sentimentScore', data.sentiment_score || 0);
                
                console.log('📈 Storing sales trend:', data.sales_trend);  
                window.dataStore.setData('salesTrend', data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' });
                
                console.log('🏷️ Storing product info:', data.product_info);
                window.dataStore.setData('productInfo', data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' });
                
                console.log('📊 Storing chart data:', data.chart_data);
                window.dataStore.setData('chartData', data.chart_data || {});
                
                console.log('💬 Storing common phrases:', data.common_phrases);
                window.dataStore.setData('commonPhrases', data.common_phrases || []);
                
                window.dataStore.setData('analysisComplete', true);
                
                console.log('🔍 === FINAL DATASTORE CONTENTS ===');
                const allData = window.dataStore.getAllData();
                console.log('Complete data store contents:', allData);
                
                // Verify each key exists
                Object.keys(allData).forEach(key => {
                    console.log(`✓ ${key}:`, allData[key]);
                });
                
            } else {
                console.error('❌ DataStore not found!');
            }

            // Update DOM-based UI components
            if (window.DOMUpdater) {
                console.log('🖼️ Updating DOM components...');
                DOMUpdater.updateProductInfo(data.product_info || {});
                DOMUpdater.updatePhrases(data.common_phrases || []);
            }
            
            if (data.chart_data && window.ChartManager) {
                console.log('📊 Updating charts...');
                ChartManager.update(data.chart_data);
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
            console.error('Error details:', error.message, error.stack);
            alert(`Analysis failed: ${error.message}`);
            if (window.dataStore) {
                window.dataStore.setData('analysisComplete', false);
            }
        } finally {
            // Reset button state
            if (analyzeBtn) {
                console.log('🔄 Resetting button state...');
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = analyzeBtn._originalContent || '<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>Analyze CSV';
                console.log('✅ Button reset completed');
            }
        }
    };

    console.log('🚀 Main application loaded and ready');
}
