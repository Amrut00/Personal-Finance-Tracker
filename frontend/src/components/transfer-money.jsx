import { DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { MdOutlineWarning } from 'react-icons/md';
import { toast } from 'sonner';
import DialogWrapper from './wrappers/dialog-wrapper';
import Loading from './loading';
import { formatCurrency } from '../libs';
import { Button } from './ui/button';
import useStore from '../store';
import api from '../libs/apiCall';
import Input from './ui/input';

const TransferMoney = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [fromAccountInfo, setFromAccountInfo] = useState({});
  const [toAccountInfo, setToAccountInfo] = useState({});

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const newData = {
        ...data,
        from_account: fromAccountInfo._id,
        to_account: toAccountInfo._id,
      };

      const { data: res } = await api.put(`/transaction/transfer-money`, newData);
      if (res?.status === "success") {
        toast.success(res?.message);
        setIsOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (setAccount, val) => {
    const filteredAccount = accountData?.find(
      (account) => account.accountName === val
    );

    setAccount(filteredAccount);
  };

  function closeModal() {
    setIsOpen(false);
  }

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/account`);
      setAccountData(res?.data);
    } catch (error) {
      console.log("Error fetching accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all'>
        <DialogTitle as='h3' className='text-lg font-medium leading-6 text-gray-700 mb-4 uppercase'>
          Transfer Money
        </DialogTitle>

        {isLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className='flex flex-col gap-1 mb-2'>
              <p className='text-gray-700 dark:text-gray-400 text-sm mb-2'>From Account</p>
              <select
                onChange={(e) => getAccountBalance(setFromAccountInfo, e.target.value)}
                className='inputStyles'
              >
                <option disabled selected>Select From Account</option>
                {accountData?.map((acc, index) => (
                  <option key={index} value={acc?.accountName}>
                    {acc?.accountName} - {formatCurrency(acc?.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1 mb-2'>
              <p className='text-gray-700 dark:text-gray-400 text-sm mb-2'>To Account</p>
              <select
                onChange={(e) => getAccountBalance(setToAccountInfo, e.target.value)}
                className='inputStyles'
              >
                <option disabled selected>Select To Account</option>
                {accountData?.map((acc, index) => (
                  <option key={index} value={acc?.accountName}>
                    {acc?.accountName} - {formatCurrency(acc?.balance)}
                  </option>
                ))}
              </select>
            </div>

            {fromAccountInfo?.balance <= 0 && (
              <div className='flex items-center gap-2 bg-yellow-400 text-black p-2 mt-6 rounded'>
                <MdOutlineWarning size={30} />
                <span className='text-sm'>
                  You cannot transfer money from this account. Insufficient balance.
                </span>
              </div>
            )}

            {fromAccountInfo.balance > 0 && toAccountInfo._id ? (
              <>
                <Input
                  name='amount'
                  type='number'
                  label='Amount'
                  placeholder='1000'
                  {...register("amount", { required: "Transaction amount is required!" })}
                  error={errors.amount ? errors.amount.message : ""}
                  className='inputStyle'
                />

                <div className='w-full mt-8'>
                  <Button
                    disabled={loading}
                    type='submit'
                    className='bg-violet-700 text-white w-full mt-4'
                  >
                    {`Transfer ${watch("amount") ? formatCurrency(watch("amount")) : ""}`}
                  </Button>
                </div>
              </>
            ) : (
              <div className='text-center py-4 text-gray-500 dark:text-gray-400'>
                {!fromAccountInfo._id ? "Please select a source account" : 
                 !toAccountInfo._id ? "Please select a destination account" :
                 fromAccountInfo.balance <= 0 ? "Insufficient balance in source account" :
                 "Select accounts to transfer money"}
              </div>
            )}
          </form>
        )}
      </DialogPanel>
    </DialogWrapper>
  );
};

export default TransferMoney;
