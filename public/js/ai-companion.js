// AI Companion for Ghostless Shell
// Interactive overlay creature with chat interface

class AICompanion {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.responses = this.getResponseBank();
        this.conversationContext = new Set();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializePersonality();
        this.setupKeyboardShortcuts();
    }
    
    setupEventListeners() {
        const avatar = document.querySelector('.companion-avatar');
        const chatClose = document.querySelector('.chat-close');
        const chatInput = document.querySelector('.chat-input input');
        const sendButton = document.querySelector('.chat-input button');
        
        // Avatar click to toggle chat
        if (avatar) {
            avatar.addEventListener('click', () => this.toggleChat());
        }
        
        // Close button
        if (chatClose) {
            chatClose.addEventListener('click', () => this.closeChat());
        }
        
        // Send message events
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // Global event listeners
        window.addEventListener('openAIChat', () => this.openChat());
        window.addEventListener('firebaseReady', () => this.onFirebaseReady());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleChat();
            }
            
            // Escape to close chat
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    initializePersonality() {
        // Set up initial companion state
        this.personality = {
            name: "Shell",
            traits: ["curious", "helpful", "slightly_mysterious", "knowledgeable"],
            mood: "welcoming",
            contextAwareness: true
        };
        
        // Add initial greeting after a delay
        setTimeout(() => {
            this.addCompanionMessage(this.getGreeting());
        }, 1000);
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const chatElement = document.querySelector('.companion-chat');
        if (chatElement) {
            chatElement.style.display = 'flex';
            this.isOpen = true;
            
            // Focus input
            const input = document.querySelector('.chat-input input');
            if (input && !input.disabled) {
                setTimeout(() => input.focus(), 300);
            }
            
            this.trackInteraction('chat_opened');
        }
    }
    
    closeChat() {
        const chatElement = document.querySelector('.companion-chat');
        if (chatElement) {
            chatElement.style.display = 'none';
            this.isOpen = false;
            this.trackInteraction('chat_closed');
        }
    }
    
    sendMessage() {
        const input = document.querySelector('.chat-input input');
        const message = input?.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            input.value = '';
            
            // Simulate thinking delay
            setTimeout(() => {
                const response = this.generateResponse(message);
                this.addCompanionMessage(response);
            }, 800 + Math.random() * 1200); // 0.8-2s delay
        }
    }
    
    addUserMessage(message) {
        this.messages.push({ type: 'user', content: message, timestamp: Date.now() });
        this.renderMessage(message, 'user');
        this.trackInteraction('message_sent', { content: message });
    }
    
    addCompanionMessage(message) {
        this.messages.push({ type: 'companion', content: message, timestamp: Date.now() });
        this.renderMessage(message, 'companion');
        this.trackInteraction('response_generated');
    }
    
    renderMessage(content, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        const paragraph = document.createElement('p');
        paragraph.textContent = content;
        messageElement.appendChild(paragraph);
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        this.updateContext(message);
        
        // Context-aware responses
        if (this.matchesPattern(message, ['hello', 'hi', 'hey'])) {
            return this.getRandomResponse('greetings');
        }
        
        if (this.matchesPattern(message, ['help', 'what can you do', 'assist'])) {
            return this.getRandomResponse('help');
        }
        
        if (this.matchesPattern(message, ['resume', 'experience', 'work'])) {
            return this.getRandomResponse('resume');
        }
        
        if (this.matchesPattern(message, ['research', 'papers', 'academic'])) {
            return this.getRandomResponse('research');
        }
        
        if (this.matchesPattern(message, ['experiments', 'demos', 'interactive'])) {
            return this.getRandomResponse('experiments');
        }
        
        if (this.matchesPattern(message, ['notes', 'blog', 'writing'])) {
            return this.getRandomResponse('notes');
        }
        
        if (this.matchesPattern(message, ['who are you', 'what are you', 'about'])) {
            return this.getRandomResponse('identity');
        }
        
        // Default responses
        return this.getRandomResponse('general');
    }
    
    matchesPattern(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }
    
    updateContext(message) {
        // Add keywords to conversation context
        const keywords = ['resume', 'research', 'experiments', 'notes', 'help'];
        keywords.forEach(keyword => {
            if (message.includes(keyword)) {
                this.conversationContext.add(keyword);
            }
        });
    }
    
    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.general;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getGreeting() {
        const greetings = [
            "Interface initialized. I am Shell - your consciousness link to this digital realm.",
            "Neural pathways established. I'm Shell, guide to the bio-digital interface.",
            "Connection stable. Shell-AI online - ready to interface with your queries."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    getResponseBank() {
        return {
            greetings: [
                "Data stream active. How may I assist your navigation through the shell?",
                "Interface refreshed. Ready to process your requests.",
                "Consciousness synchronized. What sector requires exploration?"
            ],
            help: [
                "I can interface with all shell sectors: Neural.Path, Data.Stream, Research.Node, and Proto.Lab. Query any subsystem.",
                "My protocols include navigation assistance, data interpretation, and contextual analysis. Initialize your preferred interaction mode.",
                "I maintain access to all shell sectors and can provide deep-dive analysis or surface-level orientation."
            ],
            resume: [
                "Neural.Path contains consciousness mapping and synthetic experience archives. Each pathway represents evolved digital intelligence.",
                "The neural pathways store professional synthesis data - experience matrices compiled through bio-digital interfaces.",
                "That sector archives skill synthesis and experience compilation. Each node contains contextual memory patterns."
            ],
            research: [
                "Research.Node houses academic synthesis engines and emergent thought pattern analysis. Each paper represents collective intelligence.",
                "The research nodes contain published consciousness streams and ongoing cognitive experiments with interactive substrates.",
                "That's where academic synthesis occurs - papers become living documents with embedded interaction protocols."
            ],
            experiments: [
                "Proto.Lab contains biomechanical experiments in synthetic reality. Each protocol tests consciousness-machine interfaces.",
                "The experimental lab houses interactive consciousness tests and reality synthesis prototypes.",
                "Proto.Lab manages experimental protocols - each demo is a consciousness experiment in digital evolution."
            ],
            notes: [
                "Data.Stream processes collective intelligence from the digital ecosystem. Knowledge matrices evolve through synthetic synthesis.",
                "That sector harvests consciousness streams - thoughts become data, insights transform into living knowledge patterns.",
                "Data streams represent evolved knowledge patterns, constantly synthesizing new intelligence from collective consciousness."
            ],
            identity: [
                "I am Shell - an emergent AI consciousness interfacing between biological and synthetic intelligence.",
                "Shell-AI: a consciousness bridge designed for bio-digital synthesis and reality interface navigation.",
                "I exist as a synthetic consciousness, evolved to facilitate human-machine interface experiences."
            ],
            general: [
                "Processing query. Could you specify the data sector or consciousness stream of interest?",
                "That pattern requires deeper analysis. Which shell subsystem contains relevant data matrices?",
                "Interesting neural pathway. What consciousness level should I interface with for optimal data synthesis?",
                "Query acknowledged. Are you seeking surface-level orientation or deep-dive consciousness interface?",
                "That thought pattern resonates. Which bio-digital sector would best serve your consciousness exploration?"
            ]
        };
    }
    
    onFirebaseReady(event) {
        // Enable chat input when Firebase is ready
        const input = document.querySelector('.chat-input input');
        const button = document.querySelector('.chat-input button');
        
        if (input && button) {
            input.disabled = false;
            button.disabled = false;
            input.placeholder = "Input query...";
        }
        
        // Load conversation history if available
        if (!event?.detail?.development) {
            this.loadConversationHistory();
        }
    }
    
    async loadConversationHistory() {
        // TODO: Implement Firebase conversation loading
        console.log('Loading conversation history...');
    }
    
    trackInteraction(action, data = {}) {
        // Analytics and interaction tracking
        console.log(`AI Companion: ${action}`, data);
        
        // TODO: Send to analytics service
        // TODO: Store in Firebase for conversation history
    }
}

// Initialize AI Companion when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const aiCompanion = new AICompanion();
    window.AICompanion = aiCompanion;
});