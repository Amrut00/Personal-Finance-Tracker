import { DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../libs';
import DialogWrapper from './wrappers/dialog-wrapper';
import api from '../libs/apiCall';
import { toast } from 'sonner';
import { Button } from './ui/button';

const ViewTransaction = ({ data, isOpen, setIsOpen, refreshData }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(data?.account_id || "");
  const [isEditMode, setIsEditMode] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [source, setSource] = useState(data?.source || "");
  const [description, setDescription] = useState(data?.description || "");
  const [status, setStatus] = useState(data?.status || "");
  const [amount, setAmount] = useState(data?.amount || "");
  const [type, setType] = useState(data?.type || "");

  const [category, setCategory] = useState(data?.category || "Uncategorized");
  

  const categories = ["Uncategorized", "Groceries", "Rent", "Utilities", "Entertainment", "Healthcare", "Travel", "Education", "Others"];

  useEffect(() => {
    setSource(data?.source || "");
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

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
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
        refreshData();
        setIsOpen(false);
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
                onChange={(e) => setDescription(e.target.value)}
                className='w-full border border-gray-300 p-2 rounded'
              />

              <label className='text-gray-600'>Amount</label>
              <input
                type='number'
                name='amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='w-full border border-gray-300 p-2 rounded'
              />

              <label className='text-gray-600'>Status</label>
              <select
                name='status'
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='w-full border border-gray-300 p-2 rounded'
              >
                <option value='Pending'>Pending</option>
                <option value='Completed'>Completed</option>
                <option value='Rejected'>Rejected</option>
              </select>

              <label className='text-gray-600'>Category</label>
              <select
                name='category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full border border-gray-300 p-2 rounded'
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className='flex justify-end gap-4 mt-4'>
                <Button onClick={handleSave} className='bg-blue-600 text-white'>
                  Save Changes
                </Button>
                <Button onClick={closeModal} variant='outline'>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              
              <p className='text-lg text-gray-700'><strong>Description:</strong> {data?.description}</p>
              <p className='text-lg text-gray-700'><strong>Amount:</strong> {formatCurrency(data?.amount)}</p>
              <p className='text-lg text-gray-700'><strong>Status:</strong> {data?.status}</p>
              <p className='text-lg text-gray-700'><strong>Category:</strong> {data?.category || "Uncategorized"}</p>

              <div className='flex justify-end gap-4 mt-4'>
                <Button onClick={() => setIsEditMode(true)} className='bg-green-600 text-white'>
                  Edit
                </Button>
                <Button onClick={handleDelete} className='bg-red-600 text-white'>
                  Delete
                </Button>
                <Button onClick={closeModal} className='bg-violet-800 text-white'>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogPanel>
    </DialogWrapper>
  );
};

export default ViewTransaction;
