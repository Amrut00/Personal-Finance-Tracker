import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import AccountPage from "./pages/account-page";
import Transactions from "./pages/transactions";
import Budgets from './pages/budget-page';
import useStore from './store';
import Navbar from './components/navbar';

const RootLayout = () => {
  const { user, isInitialized } = useStore((state) => state);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }
  
  return !user ? <Navigate to="/sign-in" replace={true} /> : (
    <>
      <Navbar />
      <div className='min-h-[cal(h-screen-100px)]'>
        <Outlet />
      </div>
    </>
  );
};

function App() {
  const { initializeStore } = useStore();

  useEffect(() => {
    initializeStore(); // ✅ Load Zustand store & restore token
  }, []);

  return (
    <main className='w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900'>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path='/' element={<Navigate to='/overview' />} />
          <Route path='/overview' element={<Dashboard />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/accounts' element={<AccountPage />} />
          <Route path='/budgets' element={<Budgets />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
      </Routes>
    </main>
  );
}

export default App;
