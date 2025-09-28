// Navigation and Section Management for Ghostless Shell

class NavigationManager {
    constructor() {
        this.currentSection = 'hero';
        this.sections = ['hero', 'resume', 'notes', 'research', 'experiments'];
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollSpy();
        this.setupSmoothScrolling();
        this.animateSections();
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });
    }
    
    setupScrollSpy() {
        const sections = document.querySelectorAll('.content-section, .hero-section');
        const navLinks = document.querySelectorAll('.nav-links a[data-section]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    const sectionId = entry.target.id;
                    this.updateActiveNavLink(sectionId, navLinks);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    updateActiveNavLink(sectionId, navLinks) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });
    }
    
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 100; // Account for fixed nav
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            this.currentSection = sectionId;
            this.trackNavigation(sectionId);
        }
    }
    
    setupSmoothScrolling() {
        // Handle any internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 100;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    animateSections() {
        const sections = document.querySelectorAll('.content-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            observer.observe(section);
        });
    }
    
    trackNavigation(sectionId) {
        // Analytics tracking would go here
        console.log(`Navigated to section: ${sectionId}`);
        
        // Update browser history without page reload
        if (history.pushState) {
            const newUrl = `${window.location.pathname}#${sectionId}`;
            history.pushState({ section: sectionId }, '', newUrl);
        }
    }
    
    // Public method to get current section
    getCurrentSection() {
        return this.currentSection;
    }
    
    // Public method for programmatic navigation
    goToSection(sectionId) {
        if (this.sections.includes(sectionId)) {
            this.navigateToSection(sectionId);
        }
    }
}

// Hero section interactions
class HeroManager {
    constructor(navigationManager) {
        this.nav = navigationManager;
        this.init();
    }
    
    init() {
        this.setupHeroActions();
        this.setupIntroAnimation();
    }
    
    setupHeroActions() {
        const exploreBtn = document.querySelector('[data-action="explore"]');
        const chatBtn = document.querySelector('[data-action="chat"]');
        
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.nav.goToSection('resume');
            });
        }
        
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                // Trigger AI companion chat
                window.dispatchEvent(new CustomEvent('openAIChat'));
            });
        }
    }
    
    setupIntroAnimation() {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                heroContent.style.transition = 'all 1s ease-out';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 200);
        }
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const navigationManager = new NavigationManager();
    const heroManager = new HeroManager(navigationManager);
    
    // Make navigation manager globally available
    window.NavigationManager = navigationManager;
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.section) {
            navigationManager.goToSection(e.state.section);
        }
    });
    
    // Handle initial hash if present
    if (window.location.hash) {
        const section = window.location.hash.substring(1);
        setTimeout(() => {
            navigationManager.goToSection(section);
        }, 500);
    }
});

// CSS animation classes
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .nav-links a.active {
        color: var(--secondary-color);
    }
    
    .nav-links a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);