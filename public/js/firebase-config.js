// Firebase Configuration for Ghostless Shell
// This file will contain Firebase initialization

// TODO: Replace with actual Firebase config
const firebaseConfig = {
    // These will be added when Firebase project is set up
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase (when config is ready)
let app, db, auth;

function initializeFirebase() {
    try {
        // Initialize Firebase
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log('Firebase initialized successfully');
        
        // Set up Firestore settings
        db.settings({
            timestampsInSnapshots: true
        });
        
        return true;
    } catch (error) {
        console.warn('Firebase initialization deferred - config pending:', error.message);
        return false;
    }
}

// Firebase utility functions
const FirebaseUtils = {
    // Check if Firebase is initialized
    isInitialized() {
        return !!app && !!db;
    },
    
    // Get Firestore reference
    getFirestore() {
        return db;
    },
    
    // Get Auth reference
    getAuth() {
        return auth;
    },
    
    // Collection references
    collections: {
        resume: () => db?.collection('resume'),
        notes: () => db?.collection('notes'),
        research: () => db?.collection('research'),
        experiments: () => db?.collection('experiments'),
        chat: () => db?.collection('chat_sessions')
    }
};

// Try to initialize Firebase on load
document.addEventListener('DOMContentLoaded', () => {
    const initialized = initializeFirebase();
    
    if (initialized) {
        // Dispatch custom event for other modules
        window.dispatchEvent(new CustomEvent('firebaseReady'));
    } else {
        // Show development message
        console.log('🔥 Firebase config pending - running in development mode');
        
        // Simulate Firebase ready event for development
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('firebaseReady', { 
                detail: { development: true } 
            }));
        }, 100);
    }
});

// Export for use in other modules
window.FirebaseUtils = FirebaseUtils;