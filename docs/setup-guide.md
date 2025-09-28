# Ghostless Shell - Setup Guide

This guide will help you get Ghostless Shell running locally and deployed to Firebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase CLI
- Git

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/myl1ne/template_copilot.git
   cd template_copilot
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The site will be available at `http://localhost:3000/public`

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "ghostless-shell"
3. Enable Firestore Database
4. Enable Authentication (if needed for admin features)
5. Enable Hosting

### 2. Configure Project
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in Project**
   ```bash
   firebase init
   ```
   - Select: Hosting, Firestore
   - Use existing project: ghostless-shell
   - Accept default settings

### 3. Update Firebase Config
Edit `public/js/firebase-config.js` with your project config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 4. Deploy to Firebase
```bash
firebase deploy
```

## 📝 Content Management

### Adding Resume Data
Create documents in the `resume` collection:
```javascript
{
  title: "Senior Software Engineer",
  company: "Tech Company",
  period: "2022 - Present",
  description: "Leading development of innovative applications",
  tags: ["JavaScript", "AI/ML", "Firebase"],
  order: 1
}
```

### Adding Notes
Create documents in the `notes` collection:
```javascript
{
  title: "AI Companion Design Patterns",
  content: "Markdown content here...",
  excerpt: "Brief description...",
  tags: ["AI", "UX", "Design"],
  published: true,
  created_at: firebase.firestore.Timestamp.now()
}
```

### Adding Research Papers
Create documents in the `research` collection:
```javascript
{
  title: "Interactive AI Companions in Web Applications",
  journal: "HCI Research Journal",
  year: 2024,
  abstract: "This paper explores...",
  pdf_url: "https://example.com/paper.pdf",
  tags: ["HCI", "AI", "Web Development"],
  status: "Published"
}
```

### Adding Experiments
Create documents in the `experiments` collection:
```javascript
{
  title: "AI Chat Interface Prototype",
  description: "Experimental chat interface",
  demo_url: "https://example.com/demo",
  github_url: "https://github.com/user/repo",
  tags: ["AI", "Chat", "Prototype"],
  active: true,
  priority: 1
}
```

## 🛠️ Development

### Project Structure
```
public/
├── index.html          # Main HTML file
├── styles/
│   ├── main.css        # Core styles
│   └── components.css  # Component styles
└── js/
    ├── main.js         # Main application logic
    ├── navigation.js   # Navigation management
    ├── ai-companion.js # AI companion system
    └── firebase-config.js # Firebase configuration
```

### Key Features

#### AI Companion
- Context-aware responses
- Section-specific knowledge
- Conversation memory
- Customizable personality

#### Navigation System
- Smooth scrolling
- Section detection
- Browser history management
- Mobile responsive

#### Content Management
- Firebase integration
- Real-time updates
- Modular architecture
- SEO friendly

## 🎨 Customization

### Styling
- Edit CSS variables in `main.css` for theming
- Modify component styles in `components.css`
- Add custom animations and transitions

### AI Companion
- Update response bank in `ai-companion.js`
- Modify personality traits
- Add new conversation contexts

### Content Sections
- Add new sections to HTML
- Create corresponding data models
- Update navigation and routing

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build  # When build process is implemented
firebase deploy
```

### Custom Domain (Optional)
1. In Firebase Console, go to Hosting
2. Add custom domain
3. Follow DNS configuration instructions

## 📊 Analytics

The system includes built-in interaction tracking:
- Navigation events
- AI companion usage
- Content engagement
- Performance metrics

Data is stored in the `analytics` collection for analysis.

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Scripts Blocked**
   - Check browser ad blocker settings
   - Ensure CDN access is allowed

2. **Content Not Loading**
   - Verify Firebase configuration
   - Check Firestore security rules
   - Confirm data structure matches expectations

3. **AI Companion Not Responding**
   - Check console for JavaScript errors
   - Verify event listeners are attached
   - Confirm response bank is loaded

### Development Mode
The application runs in development mode with mock data when Firebase is not configured. This allows for testing and development without backend setup.

## 📞 Support

- Check the [project issues](https://github.com/myl1ne/template_copilot/issues)
- Review the [documentation](docs/)
- Refer to [Firebase documentation](https://firebase.google.com/docs)

---

*Ghostless Shell - A living digital presence*