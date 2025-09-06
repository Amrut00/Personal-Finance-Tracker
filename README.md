# Personal Finance Tracker 💰

A full-stack personal finance tracking application built with React and Node.js, featuring user authentication, transaction management, budget tracking, and account management.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens and Google OAuth
- **Transaction Management**: Add, edit, and categorize income/expenses
- **Budget Tracking**: Set and monitor spending limits by category
- **Account Management**: Manage multiple bank accounts, cash, and credit cards
- **Data Visualization**: Interactive charts and graphs for financial insights
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Zustand** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **Axios** for API calls
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api-v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api-v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the frontend development server:
```bash
npm run dev
```

## 🌐 Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account or sign in with existing credentials
3. Add your bank accounts and set up budgets
4. Start tracking your income and expenses
5. Monitor your financial health with interactive charts

## 📁 Project Structure

```
personal-finance-tracker/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── database/        # MongoDB schemas
│   ├── libs/           # Utility libraries
│   ├── middleware/     # Authentication middleware
│   ├── routes/         # API routes
│   └── index.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Zustand store
│   │   └── libs/       # Utility libraries
│   └── index.html
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api-v1/auth/sign-up` - User registration
- `POST /api-v1/auth/sign-in` - User login
- `POST /api-v1/auth/google` - Google OAuth login
- `GET /api-v1/auth/logout` - User logout

### Transactions
- `GET /api-v1/transactions` - Get user transactions
- `POST /api-v1/transactions` - Create new transaction
- `PUT /api-v1/transactions/:id` - Update transaction
- `DELETE /api-v1/transactions/:id` - Delete transaction

### Accounts
- `GET /api-v1/accounts` - Get user accounts
- `POST /api-v1/accounts` - Create new account
- `PUT /api-v1/accounts/:id` - Update account
- `DELETE /api-v1/accounts/:id` - Delete account

### Budgets
- `GET /api-v1/budgets` - Get user budgets
- `POST /api-v1/budgets` - Create new budget
- `PUT /api-v1/budgets/:id` - Update budget
- `DELETE /api-v1/budgets/:id` - Delete budget

## 🚀 Deployment

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Amrut Pathane**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- All open-source contributors
