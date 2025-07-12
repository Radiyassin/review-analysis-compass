
// API handling functions
class ApiService {
    static async uploadFile(file) {
        console.log('=== API: Starting file upload ===');
        console.log('File:', file.name, 'Size:', file.size);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            console.log('API: Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API: Server Error Response:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('=== API: RECEIVED DATA FROM BACKEND ===');
            console.log('Full response:', data);

            return data;
        } catch (error) {
            console.error('=== API: FETCH ERROR ===');
            console.error('Error details:', error);
            throw error;
        }
    }

    static async askChatbot(question) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            
            const data = await response.json();
            return data.answer || 'Sorry, I could not process your question.';
        } catch (error) {
            console.error('Chat error:', error);
            return 'Sorry, there was an error processing your question.';
        }
    }
}

window.ApiService = ApiService;
