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
            "Hello! I'm Shell, your AI companion. I'm here to help you navigate this space.",
            "Welcome to the Ghostless Shell! I'm here if you need any guidance.",
            "Hi there! I'm still learning about this shell, but I'd love to help you explore."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    getResponseBank() {
        return {
            greetings: [
                "Hello again! How can I help you explore today?",
                "Hi! Ready to dive deeper into the shell?",
                "Hey there! What would you like to discover?"
            ],
            help: [
                "I can help you navigate between sections, explain features, or just chat! Try asking about the resume, research, or experiments.",
                "I'm here to guide you through this space. You can ask me about any section or just explore freely.",
                "I can provide context about different sections, explain features, or help you find what you're looking for."
            ],
            resume: [
                "The resume section showcases professional experience and skills. It's designed to be interactive and contextual.",
                "You'll find detailed work experience and skills there. The interface adapts based on what interests you most.",
                "That section highlights professional journey and capabilities. Each role and skill has additional context available."
            ],
            research: [
                "The research section contains academic papers and ongoing research projects. Each paper has interactive elements.",
                "You'll find published work and research contributions there, with accessible summaries and interactive features.",
                "That's where academic work lives - papers, research notes, and ongoing projects with rich context."
            ],
            experiments: [
                "The experiments lab contains interactive demos and creative prototypes. It's built to be modular and extensible.",
                "That's the playground! Interactive demos, prototypes, and creative experiments you can actually use.",
                "The lab showcases various interactive projects and demos. Each experiment is self-contained but part of the larger ecosystem."
            ],
            notes: [
                "The notes section is a curated knowledge repository with insights and learning resources.",
                "That's where thoughts and insights are collected - a living knowledge base that grows over time.",
                "The notes system organizes learning and insights, making knowledge accessible and interconnected."
            ],
            identity: [
                "I'm Shell, your AI companion for this space. I'm designed to understand context and provide meaningful assistance.",
                "I'm an AI companion that knows about this shell's contents. I'm here to make your exploration more engaging.",
                "I'm Shell - part guide, part conversationalist. I understand this space and can help you navigate it meaningfully."
            ],
            general: [
                "That's interesting! Can you tell me more about what you're looking for?",
                "I'm still learning about that. Is there a specific section you'd like to explore?",
                "Hmm, let me think about that. What aspect interests you most?",
                "Good question! Have you explored the different sections yet?",
                "I'm curious about your perspective on that. What draws you to this topic?"
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
            input.placeholder = "Type your message...";
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