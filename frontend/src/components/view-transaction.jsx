import { DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { PiSealCheckFill } from 'react-icons/pi';
import { formatCurrency } from '../libs';
import DialogWrapper from './wrappers/dialog-wrapper';
import api from '../libs/apiCall';
import { toast } from 'sonner';
import { Button } from './ui/button';

const ViewTransaction = ({ data, isOpen, setIsOpen, refreshData }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [accountData, setAccountData] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(data?.account_id || "");
  const [description, setDescription] = useState(data?.description || "");
  const [status, setStatus] = useState(data?.status || "");
  const [amount, setAmount] = useState(data?.amount || "");
  const [type, setType] = useState(data?.type || "");
  const [category, setCategory] = useState(data?.category || "Uncategorized");

  const categories = ["Uncategorized", "Groceries", "Rent", "Utilities", "Entertainment", "Healthcare", "Travel", "Education", "Others"];

  useEffect(() => {
    setFormData(data || {});
    setSelectedAccountId(data?.account_id || "");
    setDescription(data?.description || "");
    setStatus(data?.status || "");
    setAmount(data?.amount || "");
    setType(data?.type || "");
    setCategory(data?.category || "Uncategorized");
    fetchAccounts();
  }, [data]);

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/account`);
      setAccountData(res?.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "description") setDescription(value);
    if (name === "status") setStatus(value);
    if (name === "amount") setAmount(value);
  };

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSave = async () => {
    try {
      const selectedAccount = accountData.find(acc => acc.id === Number(selectedAccountId));
      const payload = {
        id: data?.id,
        account_id: selectedAccountId,
        description: description,
        source: selectedAccount?.account_name || data?.source, // Use selected account as source
        amount: amount,
        type: type,
        status: status,
        category: category, // Added category to payload
      };

      const { data: res } = await api.put(`/transaction/edit-transaction/${data?.id}`, payload);

      if (res?.status === "success") {
        toast.success("Transaction updated successfully");
        setIsEditMode(false);
        refreshData();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error updating transaction", error);
      toast.error("Error updating transaction");
    }
  };

  const handleDelete = async () => {
    try {
      const { data: res } = await api.delete(`/transaction/${data?.id}`);
      
      if (res?.status === "success") {
        toast.success("Transaction deleted successfully");
        refreshData(); // Refresh transactions list
        setIsOpen(false); // Close modal
      }
    } catch (error) {
      console.error("Error deleting transaction", error);
      toast.error(error?.response?.data?.message || "Failed to delete transaction");
    }
  };

  const closeModal = () => {
    setIsEditMode(false);
    setIsOpen(false);
  };

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all'>
        <DialogTitle className='text-lg font-medium leading-6 text-gray-700 mb-4 uppercase'>
          {isEditMode ? 'Edit Transaction' : 'Transaction Detail'}
        </DialogTitle>

        <div className='space-y-3'>
          {isEditMode ? (
            <>
              <label className='text-gray-600'>Account</label>
              <select
                name='account_id'
                value={selectedAccountId}
                onChange={handleAccountChange}
                className='w-full border border-gray-300 p-2 rounded'
              >
                {accountData.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} - {formatCurrency(acc.account_balance)}
                  </option>
                ))}
              </select>

              <label className='text-gray-600'>Description</label>
              <input
                name='description'
                value={description}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2 rounded'
              />

              <label className='text-gray-600'>Amount</label>
              <input
                type='number'
                name='amount'
                value={amount}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2 rounded'
              />

              <label className='text-gray-600'>Status</label>
              <select
                name='status'
                value={status}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2 rounded'
              >
                <option value='Pending'>Pending</option>
                <option value='Completed'>Completed</option>
                <option value='Rejected'>Rejected</option>
              </select>

              {/* Category Dropdown */}
              <label className='text-gray-600'>Category</label>
              <select
                name='category'
                value={category}
                onChange={handleCategoryChange}
                className='w-full border border-gray-300 p-2 rounded'
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className='flex justify-end gap-4 mt-4'>
                <Button onClick={() => setIsEditMode(false)} variant='outline'>
                  Cancel
                </Button>
                <Button onClick={handleSave} className='bg-violet-700 text-white'>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-500'>
                <p>
                  {
                    accountData.find(acc => acc.id === data?.account_id)?.account_name ||
                    data?.source
                  }
                </p>
                <PiSealCheckFill size={30} className='text-emerald-500 ml-4' />
              </div>

              <div className='mb-10'>
                <p className='text-xl text-black dark:text-white'>{data?.description}</p>
                <span className='text-xs text-gray-600'>
                  {new Date(data?.createdat).toLocaleDateString("en-IN", { dateStyle: "full" })}{" "}
                  {new Date(data?.createdat).toLocaleTimeString("en-IN")}
                </span>
              </div>

              <div className='mt-10 mb-3 flex justify-between'>
                <p className='text-black dark:text-gray-400 text-2xl font-bold'>
                  <span className={`${data?.type === "income" ? "text-emerald-600" : "text-red-600"} font-bold`}>
                    {data?.type === "income" ? "+" : "-"}
                  </span>{" "}
                  {formatCurrency(data?.amount)}
                </p>
                <div className='flex gap-2'>
                  <Button onClick={() => setIsEditMode(true)} className='bg-blue-600 text-white'>
                    Edit
                  </Button>
                  <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </Button>
                  <Button onClick={closeModal} className='bg-violet-800 text-white'>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogPanel>
    </DialogWrapper>
  );
};

export default ViewTransaction;
