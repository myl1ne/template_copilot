// Main Application Logic for Ghostless Shell

class GhostlessShell {
    constructor() {
        this.isFirebaseReady = false;
        this.loadingStates = new Map();
        this.init();
    }
    
    init() {
        this.setupGlobalEventListeners();
        this.initializeLoadingStates();
        this.setupErrorHandling();
        this.startHealthChecks();
    }
    
    setupGlobalEventListeners() {
        // Firebase ready event
        window.addEventListener('firebaseReady', (e) => {
            this.onFirebaseReady(e.detail?.development || false);
        });
        
        // Global error handling
        window.addEventListener('error', (e) => {
            this.handleError('JavaScript Error', e.error);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError('Unhandled Promise Rejection', e.reason);
        });
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onPageVisible();
            } else {
                this.onPageHidden();
            }
        });
    }
    
    initializeLoadingStates() {
        const sections = ['resume', 'notes', 'research', 'experiments'];
        
        sections.forEach(section => {
            this.loadingStates.set(section, 'loading');
            this.updateSectionStatus(section, 'loading');
        });
    }
    
    onFirebaseReady(isDevelopment) {
        this.isFirebaseReady = true;
        console.log(`🚀 Ghostless Shell - Firebase ${isDevelopment ? 'development' : 'production'} mode`);
        
        if (isDevelopment) {
            this.setupDevelopmentMode();
        } else {
            this.loadContentSections();
        }
        
        this.updateLoadingIndicators();
    }
    
    setupDevelopmentMode() {
        console.log('🛠️ Running in development mode - using mock data');
        
        // Simulate content loading with delays
        setTimeout(() => this.loadMockContent('resume'), 1000);
        setTimeout(() => this.loadMockContent('notes'), 1500);
        setTimeout(() => this.loadMockContent('research'), 2000);
        setTimeout(() => this.loadMockContent('experiments'), 2500);
    }
    
    loadMockContent(section) {
        const mockContent = this.getMockContent(section);
        this.renderSectionContent(section, mockContent);
        this.loadingStates.set(section, 'loaded');
        this.updateSectionStatus(section, 'loaded');
    }
    
    getMockContent(section) {
        const mockData = {
            resume: {
                title: "Professional Experience",
                items: [
                    {
                        title: "Senior Software Engineer",
                        company: "Tech Company",
                        period: "2022 - Present",
                        description: "Leading development of innovative web applications with AI integration.",
                        tags: ["JavaScript", "AI/ML", "Firebase", "React"]
                    },
                    {
                        title: "Full Stack Developer", 
                        company: "Digital Agency",
                        period: "2020 - 2022",
                        description: "Built scalable web applications and interactive experiences.",
                        tags: ["Node.js", "MongoDB", "Vue.js", "UX/UI"]
                    }
                ]
            },
            notes: {
                title: "Knowledge Repository",
                items: [
                    {
                        title: "AI Companion Design Patterns",
                        date: "2024-09-15",
                        excerpt: "Exploring design patterns for creating engaging AI companions that feel natural and helpful...",
                        tags: ["AI", "UX", "Design Patterns"]
                    },
                    {
                        title: "Firebase Security Best Practices",
                        date: "2024-09-10", 
                        excerpt: "Key considerations for securing Firebase applications and protecting user data...",
                        tags: ["Firebase", "Security", "Backend"]
                    }
                ]
            },
            research: {
                title: "Research & Publications",
                items: [
                    {
                        title: "Interactive AI Companions in Web Applications",
                        journal: "HCI Research Journal",
                        year: "2024",
                        abstract: "This paper explores the design and implementation of AI companions in web applications...",
                        tags: ["HCI", "AI", "Web Development"],
                        status: "In Review"
                    }
                ]
            },
            experiments: {
                title: "Interactive Laboratory",
                items: [
                    {
                        title: "AI Chat Interface Prototype",
                        description: "Experimental chat interface with contextual awareness",
                        status: "Active",
                        tags: ["AI", "Chat", "Prototype"]
                    },
                    {
                        title: "Modular Component System",
                        description: "Extensible system for adding interactive demos",
                        status: "Planning",
                        tags: ["Architecture", "Modularity", "System"]
                    }
                ]
            }
        };
        
        return mockData[section] || { title: `${section} content`, items: [] };
    }
    
    renderSectionContent(section, content) {
        const sectionElement = document.querySelector(`#${section} .${section}-content`);
        if (!sectionElement) return;
        
        // Replace loading placeholder
        sectionElement.innerHTML = '';
        
        // Create content container
        const container = document.createElement('div');
        container.className = 'content-container';
        
        // Render items based on section type
        content.items.forEach(item => {
            const card = this.createContentCard(section, item);
            container.appendChild(card);
        });
        
        sectionElement.appendChild(container);
    }
    
    createContentCard(section, item) {
        const card = document.createElement('div');
        card.className = 'content-card';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        
        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = item.title;
        header.appendChild(title);
        
        if (item.period || item.date || item.year) {
            const meta = document.createElement('div');
            meta.className = 'card-meta';
            meta.textContent = item.period || item.date || item.year;
            header.appendChild(meta);
        }
        
        card.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'card-content';
        
        if (item.company) {
            const company = document.createElement('p');
            company.innerHTML = `<strong>${item.company}</strong>`;
            content.appendChild(company);
        }
        
        if (item.description || item.excerpt || item.abstract) {
            const desc = document.createElement('p');
            desc.textContent = item.description || item.excerpt || item.abstract;
            content.appendChild(desc);
        }
        
        if (item.status) {
            const status = document.createElement('div');
            status.className = `status-indicator ${item.status.toLowerCase().replace(' ', '-')}`;
            status.innerHTML = `<span class="status-dot"></span>${item.status}`;
            content.appendChild(status);
        }
        
        card.appendChild(content);
        
        if (item.tags) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'card-tags';
            
            item.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
            
            card.appendChild(tagsContainer);
        }
        
        return card;
    }
    
    async loadContentSections() {
        // TODO: Load actual content from Firebase
        const sections = ['resume', 'notes', 'research', 'experiments'];
        
        for (const section of sections) {
            try {
                await this.loadSectionFromFirebase(section);
            } catch (error) {
                this.handleError(`Failed to load ${section}`, error);
                this.loadingStates.set(section, 'error');
                this.updateSectionStatus(section, 'error');
            }
        }
    }
    
    async loadSectionFromFirebase(section) {
        // TODO: Implement Firebase data loading
        console.log(`Loading ${section} from Firebase...`);
        
        // Placeholder for Firebase implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                this.loadMockContent(section);
                resolve();
            }, 1000);
        });
    }
    
    updateSectionStatus(section, status) {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.dataset.status = status;
        }
    }
    
    updateLoadingIndicators() {
        // Update global loading state
        const allLoaded = Array.from(this.loadingStates.values()).every(state => 
            state === 'loaded' || state === 'error'
        );
        
        if (allLoaded) {
            document.body.classList.add('content-loaded');
            this.onContentReady();
        }
    }
    
    onContentReady() {
        console.log('🎉 All content sections loaded');
        
        // Trigger ready event for other components
        window.dispatchEvent(new CustomEvent('contentReady'));
        
        // Performance tracking
        this.trackLoadTime();
    }
    
    onPageVisible() {
        // Resume any paused animations or processes
        console.log('Page visible - resuming activities');
    }
    
    onPageHidden() {
        // Pause any resource-intensive processes
        console.log('Page hidden - pausing activities');
    }
    
    setupErrorHandling() {
        // Create error display element
        const errorContainer = document.createElement('div');
        errorContainer.id = 'error-container';
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 300px;
        `;
        document.body.appendChild(errorContainer);
    }
    
    handleError(context, error) {
        console.error(`${context}:`, error);
        
        // Show user-friendly error message
        this.showErrorMessage(`${context}: ${error.message || error}`);
        
        // TODO: Send to error tracking service
    }
    
    showErrorMessage(message) {
        const errorContainer = document.getElementById('error-container');
        if (!errorContainer) return;
        
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 10px;
            animation: slideInRight 0.3s ease-out;
        `;
        errorElement.textContent = message;
        
        errorContainer.appendChild(errorElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
    
    startHealthChecks() {
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
    }
    
    performHealthCheck() {
        // Check Firebase connection
        if (this.isFirebaseReady && window.FirebaseUtils?.isInitialized()) {
            console.log('✅ System health check passed');
        } else {
            console.warn('⚠️ System health check - Firebase not ready');
        }
    }
    
    trackLoadTime() {
        if (performance.mark) {
            performance.mark('content-loaded');
            const loadTime = performance.now();
            console.log(`📊 Content loaded in ${Math.round(loadTime)}ms`);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new GhostlessShell();
    window.GhostlessShell = app;
    
    console.log('👻 Ghostless Shell initialized');
});

// Add slideInRight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .content-loaded .content-section {
        animation-delay: 0s !important;
    }
`;
document.head.appendChild(style);