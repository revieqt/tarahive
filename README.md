# TaraG - Your Personal Travel Assistant

TaraG is a comprehensive full-stack application that brings a personal travel assistant to your fingertips. Powered by **Tara** (the AI travel assistant), the platform helps travelers discover destinations, plan itineraries, get local insights, and connect with other travelers.

## 🎯 About Tara

**Tara** is an intelligent travel assistant designed to make travel planning effortless and enjoyable. Whether you're looking for hidden gems, need restaurant recommendations, want to create the perfect itinerary, or need real-time weather and safety alerts, Tara is here to help.

### Key Features

🤖 **AI Travel Assistant**
- Ask Tara anything about travel - from "Best local food in Cebu?" to "Plan a 3-day itinerary for Baguio"
- Get personalized travel suggestions based on your preferences
- Free users: Up to 10 conversations per day
- Pro users: Unlimited conversations

🗺️ **Destination Insights**
- Explore must-visit spots and hidden gems
- Get insider tips on local culture and dining
- Discover travel routes and travel planning assistance

🌦️ **Smart Safety Features**
- Real-time weather alerts and local advisories
- Emergency alerts for various weather conditions
- Safety recommendations while traveling

👥 **Community Features**
- Connect with other travelers
- Share travel experiences and tips
- Find travel buddies with similar interests

💬 **Accessibility Features**
- Text-to-speech for AI responses
- Multi-language support
- Intuitive chat interface

## 🏗️ Technical Architecture

### **Mobile Application** (React Native + Expo)
- Native mobile experience for iOS and Android
- Real-time chat with Tara AI
- Offline support with AsyncStorage
- Responsive design for all screen sizes

### **Admin Dashboard** (React + Vite)
- Manage user accounts and content
- Monitor application analytics
- Manage Pro subscriptions
- Content moderation tools

### **Backend API** (Node.js + Express)
- RESTful API for all operations
- MongoDB for data persistence
- Authentication & authorization
- AI integration with chat services
- Rate limiting and quota management

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose (optional)
- Git

### Installation

#### Using Installation Scripts (Recommended)
```bash
# Windows (PowerShell)
.\install-dependencies.ps1

# macOS/Linux (Bash)
./install-dependencies.sh
```

#### Manual Setup
```bash
# Backend
cd backend && npm install && cd ..

# Mobile App
cd apps/tarag_app && npm install && cd ../..

# Admin Dashboard
cd apps/tarag_admin && npm install && cd ../..
```

### Environment Setup
Create `.env` files in each directory:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tarag

# apps/tarag_app/.env
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
EXPO_PUBLIC_MAX_FREE_AI_MESSAGES_PER_DAY=10
EXPO_PUBLIC_TRAVELLER_PRO_PRICE=4.99

# apps/tarag_admin/.env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Running the Application

**With Docker (Recommended):**
```bash
docker-compose up -d
```

**Manually:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile App
cd apps/tarag_app && npm start

# Terminal 3: Admin Dashboard
cd apps/tarag_admin && npm run dev
```

## 📁 Project Structure

```
TaraG-v2/
├── apps/
│   ├── tarag_admin/          # Admin dashboard
│   ├── tarag_app/            # Mobile application
│   └── tarag_portal/         # Web portal (if applicable)
├── backend/                  # REST API backend
├── docs/                     # Documentation
├── mongo_data/               # MongoDB data volume
├── docker-compose.yml        # Docker configuration
└── README.md                 # This file
```

## 💎 Monetization Model

### Free Tier
- 10 AI conversations per day
- Basic destination information
- Community features access

### Pro Tier ($4.99/month)
- Unlimited AI conversations
- Advanced travel planning features
- Priority support
- Exclusive content access

## 🔒 Security & Privacy

- Secure authentication with JWT tokens
- End-to-end encryption for sensitive data
- GDPR-compliant data handling
- Regular security audits
- Rate limiting to prevent abuse

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary and all rights are reserved.

## 💬 Support

For questions, bugs, or feature requests:
- Create an issue on GitHub
- Contact support via our feedback form
- Visit our documentation

---

**Happy Traveling with Tara! ✈️🌍**
