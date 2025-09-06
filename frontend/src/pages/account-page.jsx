import React, { useEffect, useState } from 'react'
import useStore from '../store';
import { FaBtc, FaPaypal } from 'react-icons/fa';
import { RiVisaLine } from "react-icons/ri";
import { GiCash } from 'react-icons/gi';
import { toast } from 'sonner';
import Loading from '../components/loading';
import { MdAdd, MdVerifiedUser } from 'react-icons/md';
import Title from '../components/title';
import api from '../libs/apiCall';
import AccountMenu from '../components/account-dialogue';
import { formatCurrency, maskAccountNumber } from '../libs';
import AddAccount from '../components/add-account';
import AddMoney from '../components/add-money-account';
import TransferMoney from '../components/transfer-money';

const ICONS = {
    crypto: (
        <div className="w-12 h-12 bg-amber-600 text-white flex items-center justify-center rounded-full" >
            <FaBtc size={26} />
        </div>
    ),
    "visa debit card": (
        <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full" >
            <RiVisaLine size={26} />
        </div>
    ),
    cash: (
        <div className="w-12 h-12 bg-rose-600 text-white flex items-center justify-center rounded-full" >
            <GiCash size={26} />
        </div>
    ),
    paypal: (
        <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-full" >
            <FaPaypal size={26} />
        </div>
    ),
    bank: (
        <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full" >
            <span className="text-lg font-bold">B</span>
        </div>
    ),
    credit: (
        <div className="w-12 h-12 bg-purple-600 text-white flex items-center justify-center rounded-full" >
            <span className="text-lg font-bold">C</span>
        </div>
    ),
    investment: (
        <div className="w-12 h-12 bg-orange-600 text-white flex items-center justify-center rounded-full" >
            <span className="text-lg font-bold">I</span>
        </div>
    ),
};

const AccountPage = () => {

  const { user } = useStore((state) => state);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTopup, setIsOpenTopup] = useState(false);
  const [isOpenTransfer, setIsOpenTransfer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const fetchAccounts = async () => {
    try {
      const { data:res} = await api.get(`/account`);
      setData(res?.data);
    } catch(error) {
      if(error?.response?.data?.status === "auth_failed"){
        localStorage.removeItem("user");
        window.location.reload();
      }    
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddMoney = (el) => {
    setSelectedAccount(el?._id);
    setIsOpenTopup(true);
  };

  const handleTransferMoney = (el) => {
    setSelectedAccount(el?._id);
    setIsOpenTransfer(true);
  }

  useEffect(()=> {
    setIsLoading(true);
    fetchAccounts();
  }, []);

  if(isLoading){
    return <Loading/>;
  }

  return (
    <>
      <div className='w-full py-10'>
        <div className='flex items-center justify-between'>
          <Title title='Accounts Information'/>
          <div className='flex items-center gap-4'>
            <button
              onClick={ () => setIsOpen(true)}
              className='py-1.5 px-2 rounded bg-black dark:bg-violet-600 text-white dark:text-white flex items-center justify-center gap-1 border border-gray-500'
            >
              <MdAdd size={22} />
              <span className=''>Add</span>
            </button>
          </div>
        </div>

        {data?.length == 0 ? ( 
            <>
              <div className='w-full flex items-center justify-center py-10 text-gray-600 dark:text-gray-700 text-lg'>
                <span>No Account Found</span>
              </div>
            </>
          ) : ( 
            <>
              <div className='w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 py-10 gap-6'>
                {
                  data?.map((acc, index) => (
                    <div 
                      key={index} 
                      className='w-full h-48 flex gap-4 bg-gray-50 dark:bg-slate-800 p-3 rounded shadow'
                    >
                      <div>
                        {ICONS[acc?.accountType?.toLowerCase()] || ICONS[acc?.accountName?.toLowerCase()]}
                      </div>
                  
                      <div className='space-y-2 w-full'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <p className='text-black dark:text-white text-2xl font-bold'>
                              {acc?.accountName}
                            </p>
                            <MdVerifiedUser size={26} className='text-emerald-600 ml-1' />
                          </div>
                  
                          <AccountMenu
                            addMoney={() => handleOpenAddMoney(acc)}
                            transferMoney={() => handleTransferMoney(acc)}
                          />
                        </div>
                  
                        <span className='text-gray-600 dark:text-gray-400 font-light leading-loose'>
                          {maskAccountNumber(acc?.accountNumber)}
                        </span>
                  
                        <p className='text-xs text-gray-600 dark:text-gray-500'>
                          {new Date(acc?.createdAt).toLocaleDateString("en-IN", { dateStyle: "full" })}
                        </p>
                  
                        <div className='flex items-center justify-between'>
                          <p className='text-x1 text-gray-600 dark:text-gray-400 font-medium'>
                            {formatCurrency(acc?.balance)}
                          </p>
                          <button
                            onClick={() => handleOpenAddMoney(acc)}
                            className='text-sm outline-none text-violet-600 hover:underline'
                          >
                            Add Money
                          </button>
                        </div>
                      </div>
                    </div>
                  ))                  
                }
              </div>
            </>
          )
        }
      </div>

      <AddAccount
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refetch={fetchAccounts}
        key={new Date().getTime()}
      />
      
      <AddMoney
        isOpen={isOpenTopup}
        setIsOpen={setIsOpenTopup}
        id={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 1}
      />

      <TransferMoney
        isOpen={isOpenTransfer}
        setIsOpen={setIsOpenTransfer}
        id={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 2}
      />
    </>
  )
}

export default AccountPage;
