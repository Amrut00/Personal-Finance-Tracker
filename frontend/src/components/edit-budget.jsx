import React, { useState, useEffect } from 'react';
import { DialogPanel, DialogTitle } from '@headlessui/react';
import DialogWrapper from './wrappers/dialog-wrapper';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import Input from './ui/input';
import { Button } from './ui/button';

const predefinedCategories = [
  'Groceries', 'Rent', 'Utilities', 'Entertainment', 'Healthcare', 'Travel', 'Education', 'Others', 'Custom Category'
];

const EditBudget = ({ isOpen, setIsOpen, refetch, budgetData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetData) {
      setSelectedCategory(budgetData.category);
      setIsCustomCategory(!predefinedCategories.includes(budgetData.category));

      reset({
        customCategory: !predefinedCategories.includes(budgetData.category) ? budgetData.category : '',
        budgetAmount: budgetData.budget_amount,
        startDate: budgetData.start_date?.split('T')[0],
        endDate: budgetData.end_date?.split('T')[0],
      });
    }
  }, [budgetData, reset]);

  const closeModal = () => {
    setIsOpen(false);
    reset();
    setIsCustomCategory(false);
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const category = isCustomCategory ? data.customCategory : selectedCategory;

      if (!category) {
        toast.error('Please select or enter a category.');
        return;
      }

      const payload = {
        category,
        budget_amount: data.budgetAmount,
        start_date: data.startDate,
        end_date: data.endDate,
      };

      const { data: res } = await api.put(`/budget/${budgetData.id}`, payload);

      if (res?.status === 'success') {
        toast.success('Budget updated successfully');
        refetch();
        closeModal();
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error(error?.response?.data?.message || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all'>
        <DialogTitle className='text-lg font-medium leading-6 text-gray-700 mb-4 uppercase'>
          Edit Budget
        </DialogTitle>

        <form onSubmit={handleSubmit(submitHandler)} className='space-y-6'>
          {/* Category Selection */}
          <div>
            <label className='text-gray-700 dark:text-gray-400 text-sm mb-2'>Category</label>
            <select
              className='inputStyles'
              value={selectedCategory}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCategory(value);
                setIsCustomCategory(value === 'Custom Category');
              }}
            >
              <option value='' disabled>Select Category</option>
              {predefinedCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Custom Category Input */}
          {isCustomCategory && (
            <Input
              name='customCategory'
              label='Custom Category'
              placeholder='Enter custom category'
              {...register('customCategory', { required: 'Custom category is required' })}
              error={errors.customCategory?.message}
              className='inputStyle'
            />
          )}

          {/* Budget Amount */}
          <Input
            name='budgetAmount'
            type='number'
            label='Budget Amount'
            placeholder='Enter amount'
            {...register('budgetAmount', { required: 'Budget amount is required' })}
            error={errors.budgetAmount?.message}
            className='inputStyle'
          />

          {/* Start Date */}
          <Input
            name='startDate'
            type='date'
            label='Start Date'
            {...register('startDate', { required: 'Start date is required' })}
            error={errors.startDate?.message}
            className='inputStyle'
          />

          {/* End Date */}
          <Input
            name='endDate'
            type='date'
            label='End Date'
            {...register('endDate', { required: 'End date is required' })}
            error={errors.endDate?.message}
            className='inputStyle'
          />

          <div className='w-full'>
            <Button disabled={loading} type='submit' className='bg-violet-700 text-white w-full'>
              {loading ? 'Saving...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </DialogPanel>
    </DialogWrapper>
  );
};

export default EditBudget;
