# 💰 Personal Finance Tracker

A full-stack **Personal Finance Tracker** built using **React, Node.js, Express, and PostgreSQL**. This application allows users to **manage transactions, track expenses, set budgets, and view financial reports** with an intuitive dashboard.

## 🚀 Live Demo
🔗 **[Live Website](http://finance-tracker-frontend-1111.vercel.app)**
📹 **[Working Demo Video](https://drive.google.com/file/d/1RM8gGxXeXfVHiD6kB6swAqbFQ64hOy0k/view?usp=sharing)**

---

## 📌 Features
- 🔐 **User Authentication (JWT & Google OAuth)**
- 📊 **Dashboard Overview (Income, Expenses, Balance)**
- 📜 **Add, Edit, Delete Transactions**
- 💳 **Multiple Account Support**
- 🎯 **Budget Management**
- 📈 **Financial Reports & Charts**
- 🌙 **Dark Mode Support**
- 🚀 **Fully Responsive UI**

---

## 🛠️ Tech Stack
### **Frontend:**
- React 18.2.0
- Tailwind CSS 3.4.11
- React Router
- Zustand (State Management)
- Axios

### **Backend:**
- Node.js
- Express.js
- PostgreSQL (Database)
- JWT Authentication
- Google OAuth

---

## 🚀 Installation & Setup
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

### **2️⃣ Backend Setup**
```sh
cd backend
npm install
nodemon index.js
```

**Create a `.env` file in the backend directory:**
```
PORT=5000
DATABASE_URI=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourbackendurl.com/api-v1/auth/google/callback
```

### **3️⃣ Frontend Setup**
```sh
cd frontend
npm install
npm run dev
```

**Create a `.env` file in the frontend directory:**
```
VITE_API_URL=https://yourbackendurl.com/api-v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🛠️ Deployment
### **Backend:**
- Deployed on **Render**
- Ensure all environment variables are added on Render's dashboard.

### **Frontend:**
- Deployed on **Vercel**
- Update `VITE_API_URL` with the correct backend URL.

---

## 🛡️ Authentication
- **JWT Authentication:** Used for normal login.
- **Google OAuth:** Sign in with Google using OAuth2.

---

## 🎯 To-Do (Future Enhancements)
✅ Multi-Currency Support
✅ Expense Splitting
✅ AI-Based Expense Prediction
✅ Mobile App Version

