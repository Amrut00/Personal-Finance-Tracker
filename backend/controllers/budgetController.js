import { Budget } from "../database/mongo-schema.js";

export const createBudget = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { category, budget_amount, start_date, end_date } = req.body;

    if (!(category && budget_amount && start_date && end_date)) {
      return res.status(400).json({ status: "failed", message: "All fields are required." });
    }

    const budget = new Budget({
      userId,
      category,
      budgetAmount: budget_amount,
      startDate: new Date(start_date),
      endDate: new Date(end_date)
    });
    await budget.save();

    res.status(201).json({ status: "success", message: "Budget created successfully", data: budget });
  } catch (error) {
    console.error("Create Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const budgets = await Budget.find({ userId }).sort({ startDate: -1 });

    res.status(200).json({ status: "success", data: budgets });
  } catch (error) {
    console.error("Get Budgets Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;
    const { category, budget_amount, start_date, end_date } = req.body;

    const budget = await Budget.findByIdAndUpdate(
      budget_id,
      {
        category,
        budgetAmount: budget_amount,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({ status: "success", message: "Budget updated", data: budget });
  } catch (error) {
    console.error("Update Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;

    const budget = await Budget.findByIdAndDelete(budget_id);

    res.status(200).json({ status: "success", message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Delete Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
