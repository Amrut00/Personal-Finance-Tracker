import { DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { MdOutlineWarning } from 'react-icons/md';
import { toast } from 'sonner';
import DialogWrapper from './wrappers/dialog-wrapper';
import Loading from './loading';
import { formatCurrency } from '../libs';
import useStore from '../store';
import api from '../libs/apiCall';
import Input from './ui/input';
import { Button } from './ui/button';

const AddTransaction = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore((state) => state);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [accountInfo, setAccountInfo] = useState({});
  const [category, setCategory] = useState("Uncategorized");

  const categories = ["Uncategorized", "Groceries", "Rent", "Utilities", "Entertainment", "Healthcare", "Travel", "Education", "Others"];

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const newData = {
        ...data,
        source: accountInfo.accountName,
        account_id: accountInfo._id,
        category,
      };

      const { data: res } = await api.post(`/transaction/add-transaction/${accountInfo._id}`, newData);
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

  const getAccountBalance = (val) => {
    const filteredAccount = accountData?.find((account) => account.accountName === val);
    setAccountBalance(filteredAccount ? filteredAccount.balance : 0);
    setAccountInfo(filteredAccount);
  };

  function closeModal() {
    setIsOpen(false);
  }

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/account`);
      setAccountData(res?.data);
    } catch (error) {
      console.log(error);
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
          Add Transaction
        </DialogTitle>

        {isLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit(submitHandler)} className='space-y-6'>
            <div className='flex flex-col gap-1 mb-2'>
              <p className='text-gray-700 dark:text-gray-400 text-sm mb-2'>Select Account</p>
              <select onChange={(e) => getAccountBalance(e.target.value)} className='inputStyles'>
                <option disabled selected>Select Account</option>
                {accountData?.map((acc, index) => (
                  <option key={index} value={acc?.accountName}>
                    {acc?.accountName} - {formatCurrency(acc?.balance, user?.currency)}
                  </option>
                ))}
              </select>
            </div>

            {accountBalance <= 0 && (
              <div className='flex items-center gap-2 bg-yellow-400 text-black p-2 mt-6 rounded'>
                <MdOutlineWarning size={30} />
                <span className='text-sm'>Insufficient account balance.</span>
              </div>
            )}

            {accountBalance > 0 && (
              <>
                <Input
                  name='description'
                  label='Description'
                  placeholder='Grocery Store'
                  {...register("description", { required: "Description is required!" })}
                  error={errors.description?.message}
                  className='inputStyle'
                />

                <Input
                  name='amount'
                  type='number'
                  label='Amount'
                  placeholder='1000'
                  {...register("amount", { required: "Amount is required!" })}
                  error={errors.amount?.message}
                  className='inputStyle'
                />

                <div>
                  <label className='text-gray-700 dark:text-gray-400 text-sm mb-2'>Category</label>
                  <select className='inputStyles' value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className='w-full mt-8'>
                  <Button disabled={loading} type='submit' className='bg-violet-700 text-white w-full mt-4'>
                    {`Confirm ${watch("amount") ? formatCurrency(watch("amount")) : ""}`}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogPanel>
    </DialogWrapper>
  );
};

export default AddTransaction;
