import React, { useEffect, useState } from 'react';
import api from '../libs/apiCall';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import AddBudget from '../components/add-budget';
import EditBudget from '../components/edit-budget';
import { formatCurrency } from '../libs';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  // 🔄 Fetch all budgets
  const fetchBudgets = async () => {
    try {
      const { data: res } = await api.get('/budget');
      setBudgets(res?.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // 🖊️ Handle Edit
  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setIsEditBudgetOpen(true);
  };

  // ❌ Handle Delete
  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budget/${budgetId}`);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  return (
    <div className='p-6'>
      {/* 🏷️ Page Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold dark:text-white'>Budgets</h1>
        <Button onClick={() => setIsAddBudgetOpen(true)} className='bg-violet-700 text-white'>
          Add Budget
        </Button>
      </div>

      {/* 🔄 Loading / Empty State */}
      {isLoading ? (
        <p>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div className='text-center mt-20'>
          <p className='text-xl text-gray-500 mt-2'>No budgets created yet.</p>
          <p className='text-gray-400 mt-2'>Click "Add Budget" to get started!</p>
          <Button onClick={() => setIsAddBudgetOpen(true)} className='mt-4 bg-violet-700 text-white'>
            Add Budget
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {budgets.map((budget) => (
            <div key={budget.id} className='p-4 border rounded-lg shadow-md bg-white dark:bg-slate-900'>
              <h2 className='text-lg font-semibold'>{budget.category}</h2>
              <p className='text-gray-600'>Budget: {formatCurrency(budget.budget_amount)}</p>
              <p className='text-gray-600'>Spent: {formatCurrency(budget.amount_spent)}</p>
              <p className='text-gray-600'>
                Period: {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
              </p>

              <div className='flex justify-between mt-4'>
                <Button onClick={() => handleEdit(budget)} className='bg-blue-600 text-white'>
                  Edit
                </Button>
                <Button onClick={() => handleDelete(budget.id)} className='bg-red-600 text-white'>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ➕ Add Budget Modal */}
      <AddBudget isOpen={isAddBudgetOpen} setIsOpen={setIsAddBudgetOpen} refetch={fetchBudgets} />

      {/* 🖊️ Edit Budget Modal */}
      {isEditBudgetOpen && selectedBudget && (
        <EditBudget
          isOpen={isEditBudgetOpen}
          setIsOpen={setIsEditBudgetOpen}
          refetch={fetchBudgets}
          budgetData={selectedBudget}
        />
      )}
    </div>
  );
};

export default BudgetPage;
