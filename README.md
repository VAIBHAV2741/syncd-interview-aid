# Crisp - AI-Powered Interview Assistant

A professional React application that serves as an AI-powered interview assistant for technical roles, built for the Swipe Internship Assignment.

![Crisp Interview Assistant](src/assets/interview-hero.jpg)

## 🌟 Features

### Core Functionality
- **Two-Tab Interface**: Seamless switching between Interviewee (chat) and Interviewer (dashboard) views
- **Resume Upload & Parsing**: Supports PDF and DOCX files with automatic data extraction
- **Smart Information Collection**: Chatbot collects missing candidate information before starting interviews
- **Timed AI Interviews**: Dynamic question generation with difficulty-based time limits
- **Real-time Synchronization**: Both tabs stay perfectly synced with candidate data
- **Local Data Persistence**: All progress is saved locally with automatic resume functionality
- **Welcome Back Modal**: Seamless continuation of interrupted interview sessions

### Interview Flow
- **6 Question Structure**: 2 Easy (20s each) → 2 Medium (60s each) → 2 Hard (120s each)
- **Full Stack Focus**: Questions targeting React and Node.js concepts
- **Automatic Scoring**: AI-powered answer evaluation and scoring
- **Progressive Difficulty**: Questions adapt based on technical role requirements
- **Time Management**: Visual countdown with automatic submission when time expires

### Dashboard Features
- **Candidate Management**: Complete list with search and sorting capabilities
- **Score Analytics**: Individual and average scoring with detailed breakdowns
- **Interview History**: Full chat transcripts and answer reviews
- **Contact Information**: Organized candidate contact details
- **Status Tracking**: Real-time interview progress monitoring

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand with persistence
- **File Upload**: React Dropzone
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Quick Start
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Guide

### For Candidates (Interviewee Tab)
1. **Upload Resume**: Drag & drop PDF/DOCX file or click to browse
2. **Complete Profile**: Fill in any missing information (name, email, phone)
3. **Start Interview**: Review interview structure and begin when ready
4. **Answer Questions**: Respond to 6 timed questions of increasing difficulty
5. **View Results**: Receive final score and AI-generated summary

### For Interviewers (Interviewer Dashboard)
1. **View All Candidates**: See complete list with status and scores
2. **Search & Filter**: Find candidates by name/email, sort by various criteria
3. **Review Details**: Click eye icon to view full interview transcripts
4. **Manage Candidates**: Delete candidates or export data as needed

## 🎨 Design System

### Color Palette
- **Primary**: Professional indigo/blue (#3B82F6) for trust and authority
- **Accent**: Success green (#10B981) for positive states
- **Warning**: Amber (#F59E0B) for time-sensitive elements
- **Secondary**: Light grays for subtle backgrounds and text

### Key Design Principles
- **Professional Aesthetics**: Clean, trustworthy interface suitable for corporate use
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Accessibility**: Proper contrast ratios and keyboard navigation support
- **Smooth Animations**: Subtle transitions and loading states for premium feel

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with side-by-side layouts
- **Tablet**: Adapted interface with touch-friendly controls
- **Mobile**: Streamlined interface with bottom navigation

## 🔧 Architecture Highlights

### State Management
- **Zustand Store**: Centralized state with automatic persistence
- **Real-time Updates**: Immediate synchronization across tabs
- **Local Storage**: Automatic saving with session recovery

### Component Structure
```
src/
├── components/
│   ├── interview/
│   │   ├── InterviewLayout.tsx      # Main layout with tabs
│   │   ├── IntervieweeChat.tsx      # Chat interface
│   │   ├── InterviewerDashboard.tsx # Dashboard view
│   │   ├── ResumeUpload.tsx         # File upload component
│   │   ├── QuestionTimer.tsx        # Countdown timer
│   │   └── ...                      # Additional components
│   └── ui/                          # Reusable UI components
├── stores/
│   └── interview.ts                 # Zustand store
└── pages/
    └── Index.tsx                    # Main entry point
```

### Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Efficient Re-renders**: Optimized state updates
- **Local Storage**: Reduced API calls with client-side persistence
- **Image Optimization**: Compressed assets with proper formats

## 🚧 Future Enhancements

### Planned Features
- **AI Integration**: Real Perplexity/OpenAI API integration for dynamic questions
- **Document Parsing**: Advanced resume parsing with ML-powered extraction
- **Video Interviews**: WebRTC support for face-to-face interviews
- **Analytics Dashboard**: Advanced candidate analytics and reporting
- **Multi-language Support**: Internationalization for global use
- **Export Features**: PDF reports and data export capabilities

### Technical Improvements
- **Database Integration**: Supabase backend for data persistence
- **Authentication**: User management and role-based access
- **Real-time Updates**: WebSocket integration for live collaboration
- **Advanced Scoring**: ML-powered answer evaluation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of the Swipe Internship Assignment. Built with ❤️ using modern React practices.

---

**Developed for Swipe Internship Assignment** - Showcasing full-stack development skills with React, TypeScript, and modern UI design patterns.