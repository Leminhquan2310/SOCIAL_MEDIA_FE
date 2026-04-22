# 🌐 Social Media Frontend

A modern frontend application for a social media platform, built with React, providing a smooth user experience with real-time interaction and responsive UI.

---

## 🚀 Overview

This project is the frontend client for a full-stack social media system. It connects to the backend APIs to deliver features like authentication, post interaction, messaging, and notifications.

---

## ✨ Features

- 🔐 **Authentication**
  - Login / Register
  - JWT-based authentication
  - OAuth2 login (Google / Facebook)

- 👤 **User System**
  - View and update user profile
  - Follow / unfollow users

- 📝 **Post & Interaction**
  - Create posts (text, image, video)
  - Like, comment, share posts

- 💬 **Real-time Features**
  - Messaging system
  - Notifications using WebSocket

- 🎨 **UI/UX**
  - Responsive design
  - Clean and modern interface

---

## 🛠️ Tech Stack

- **Framework:** React.js (Vite)
- **State Management:** Redux (Thunk)
- **Routing:** React Router
- **UI Library:** Ant Design
- **API Communication:** Axios
- **Real-time:** WebSocket (STOMP)

---

## 📂 Project Structure
```
src/
├── assets/ # Images, icons, static files
├── components/ # Reusable UI components
├── pages/ # Main pages (Home, Profile, Login...)
├── redux/ # Store, reducers, actions
├── services/ # API calls
├── utils/ # Helper functions
├── routes/ # Route configuration
└── App.jsx # Root component
```

---

## ⚙️ Installation & Setup

### 1. Clone repository

```bash
git clone https://github.com/Leminhquan2310/SOCIAL_MEDIA_FE.git
cd SOCIAL_MEDIA_FE
```
### 2. Install dependencies
```
npm install
```

### 3. Setup environment variables

Create a .env file in the root folder:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

### 4. Run development server
npm run dev
App will run at:
```
http://localhost:5173
```
### 5. Build for production
npm run build
🔌 Backend Requirement

Make sure the backend server is running:

- Backend repo: https://github.com/Leminhquan2310/SOCIAL_MEDIA_BE
- Default API URL: http://localhost:8080
- 
📸 Screenshots (Optional)

Add screenshots here to showcase UI

📈 Future Improvements
Dark mode
Infinite scroll optimization
Better state management (Redux Toolkit)
PWA support

👨‍💻 Author
GitHub: https://github.com/Leminhquan2310
