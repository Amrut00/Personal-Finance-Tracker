import { useEffect, useState } from 'react';
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
import { setAuthToken } from './libs/apiCall';
import { jwtDecode } from 'jwt-decode';

const RootLayout = () => {
  const { user } = useStore((state) => state);

  return !user ? (
    <Navigate to="/sign-in" replace={true} />
  ) : (
    <>
      <Navbar />
      <div className='min-h-[cal(h-screen-100px)]'>
        <Outlet />
      </div>
    </>
  );
};

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

function App() {
  const { theme, setCredentials, logout } = useStore((state) => state);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && isTokenValid(storedToken)) {
      setCredentials({ ...storedUser, token: storedToken });
      setAuthToken(storedToken);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      logout();
    }
  }, []);

  return (
    <main className='w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900'>
      <div>
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
      </div>
    </main>
  );
}

export default App;
