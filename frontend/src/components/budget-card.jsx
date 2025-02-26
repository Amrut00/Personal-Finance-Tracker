import { formatCurrency } from '../libs';
import { ProgressBar } from './ui/progress-bar';
import { Button } from './ui/button';
import api from '../libs/apiCall';
import { toast } from 'sonner';

const BudgetCard = ({ data, refetch }) => {
  const { id, category, budget_amount, amount_spent, start_date, end_date } = data;

  const deleteBudget = async () => {
    try {
      await api.delete(`/budget/${id}`);
      toast.success("Budget deleted");
      refetch();
    } catch (error) {
      console.error("Delete Budget Error:", error);
      toast.error("Failed to delete");
    }
  };

  const percentage = ((amount_spent / budget_amount) * 100).toFixed(2);

  return (
    <div className='p-4 bg-white shadow-md rounded-lg dark:bg-slate-900'>
      <h2 className='text-xl font-semibold dark:text-white'>{category}</h2>
      <p className='text-sm text-gray-500'>From: {start_date} To: {end_date}</p>

      <ProgressBar value={percentage} />

      <p className='mt-2'>
        {formatCurrency(amount_spent)} / {formatCurrency(budget_amount)} ({percentage}%)
      </p>

      <div className='flex justify-end gap-2 mt-4'>
        <Button onClick={deleteBudget} className='bg-red-600 text-white'>Delete</Button>
      </div>
    </div>
  );
};

export default BudgetCard;
