# Budget Buddy 💰

A comprehensive personal finance tracking application that helps you manage your money like a pro! Built with modern web technologies, Budget Buddy offers intuitive transaction management, smart budgeting, and insightful analytics to keep your finances on track.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Authentication**: JWT-based authentication with password hashing
- **Google OAuth Integration**: One-click sign-in with Google accounts
- **Session Management**: Persistent login with automatic token refresh
- **Protected Routes**: Secure access to user-specific data

### 💳 Transaction Management
- **Add Transactions**: Record income and expenses with detailed categorization
- **Edit & Delete**: Modify or remove transactions with real-time balance updates
- **Transaction History**: View all transactions with search and date filtering
- **Transfer Money**: Move funds between different accounts seamlessly

### 🏦 Account Management
- **Multiple Account Types**: Support for 4 account types with distinct visual icons (Crypto, Visa Debit Card, Paypal, or Cash)
- **Account Creation**: Easy setup with initial balance configuration
- **Balance Tracking**: Real-time balance updates across all accounts
- **Account Overview**: Visual representation with masked account numbers and balance display

### 📊 Budget & Analytics
- **Smart Budgeting**: Set monthly budgets by category
- **Budget Tracking**: Monitor spending against budget limits with visual progress bars
- **Financial Dashboard**: Comprehensive overview of your financial health
- **Interactive Charts**: Beautiful data visualization with Recharts
- **Monthly Analytics**: Track income vs expenses with detailed breakdowns

### 🎨 User Experience
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Real-time Notifications**: Toast notifications for all user actions
- **Intuitive UI**: Clean, modern interface with smooth animations
- **Form Validation**: Comprehensive input validation with helpful error messages

### 🌍 Internationalization
- **Multi-Currency Support**: Support for different currencies (INR, USD, EUR, etc.)
- **Country Selection**: Choose your country for localized experience

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Zustand** for lightweight state management
- **React Router DOM** for client-side routing
- **Tailwind CSS** for utility-first styling
- **React Hook Form** with Zod validation for forms
- **Axios** for HTTP client with interceptors
- **Recharts** for beautiful data visualization
- **Sonner** for toast notifications
- **Headless UI** for accessible components
- **React Icons** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **Google Auth Library** for OAuth integration
- **bcryptjs** for password hashing
- **CORS** for cross-origin resource sharing
- **Express Session** for session management
- **MongoDB Atlas** for cloud database hosting

## 🌐 Usage

### Getting Started
1. **Launch the Application**: Open your browser and navigate to `http://localhost:5173`
2. **Create Account**: Sign up with email/password or use Google OAuth for quick access
3. **Set Up Profile**: Choose your country and preferred currency in settings
4. **Add Accounts**: Create your first account (Crypto, Visa Debit Card, Paypal, or Cash)
5. **Start Tracking**: Add your first transaction and set up budgets

### Key Workflows
- **Adding Transactions**: Select account → Enter details → Categorize → Save
- **Managing Budgets**: Set monthly limits → Track spending progress
- **Transferring Money**: Choose source → Select destination → Enter amount
- **Viewing Analytics**: Check dashboard for insights and trends
- **Account Management**: Add/edit accounts and monitor balances

### Pro Tips
- Use categories consistently for better analytics
- Set realistic budgets based on your spending patterns
- Regularly review your dashboard for financial insights
- Take advantage of the dark/light theme toggle
