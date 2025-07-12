
// Chatbot functions
class ChatbotManager {
    static toggle() {
        const chatbox = document.getElementById('chatbox');
        if (chatbox) {
            chatbox.classList.toggle('chat-hidden');
        }
    }

    static async ask() {
        const questionInput = document.getElementById('userQuestion');
        const chatLog = document.getElementById('chat-log');
        
        if (!questionInput || !chatLog) return;
        
        const question = questionInput.value.trim();
        if (!question) return;
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user bg-blue-100 p-3 rounded-lg text-sm max-w-xs ml-auto text-right';
        userMsg.textContent = question;
        chatLog.appendChild(userMsg);
        
        questionInput.value = '';
        
        try {
            const answer = await ApiService.askChatbot(question);
            
            // Add bot response
            const botMsg = document.createElement('div');
            botMsg.className = 'message bot bg-gray-100 p-3 rounded-lg text-sm';
            botMsg.textContent = answer;
            chatLog.appendChild(botMsg);
            
            chatLog.scrollTop = chatLog.scrollHeight;
            
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message bot bg-gray-100 p-3 rounded-lg text-sm';
            errorMsg.textContent = 'Sorry, there was an error processing your question.';
            chatLog.appendChild(errorMsg);
        }
    }
}

window.toggleChatbot = ChatbotManager.toggle;
window.askBot = ChatbotManager.ask;
