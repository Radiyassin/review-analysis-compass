
// Main application entry point
console.log('Loading main application...');

// Prevent multiple initializations
if (window.mainAppLoaded) {
    console.log('Main app already loaded, skipping...');
} else {
    window.mainAppLoaded = true;
    
    // Load all modules
    const scripts = [
        '/js/dataStore.js',
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
        
        // Mark data store as ready
        if (window.dataStore) {
            window.dataStore.markReady();
        }
        
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
        
        // Show loading state
        if (window.DOMUpdater) {
            DOMUpdater.updateButtonState(true);
        }

        try {
            // Upload and analyze file
            const data = await ApiService.uploadFile(selectedFile);

            if (!data.success && !data.chart_data) {
                throw new Error('Invalid response from server');
            }

            console.log('=== STORING DATA IN DATASTORE ===');
            
            // Store all data in the centralized data store
            if (window.dataStore) {
                window.dataStore.setData('sentimentScore', data.sentiment_score || 0);
                window.dataStore.setData('salesTrend', data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' });
                window.dataStore.setData('productInfo', data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' });
                window.dataStore.setData('chartData', data.chart_data || {});
                window.dataStore.setData('commonPhrases', data.common_phrases || []);
                window.dataStore.setData('analysisComplete', true);
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
            if (window.DOMUpdater) {
                DOMUpdater.updateButtonState(false);
            }
        }
    };

    console.log('Main application loaded');
}
