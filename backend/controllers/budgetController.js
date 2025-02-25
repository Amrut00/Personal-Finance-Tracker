import { pool } from "../libs/database.js";

export const createBudget = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { category, budget_amount, start_date, end_date } = req.body;

    if (!(category && budget_amount && start_date && end_date)) {
      return res.status(400).json({ status: "failed", message: "All fields are required." });
    }

    const newBudget = await pool.query(
      `INSERT INTO tblbudget (user_id, category, budget_amount, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, category, budget_amount, start_date, end_date]
    );

    res.status(201).json({ status: "success", message: "Budget created successfully", data: newBudget.rows[0] });
  } catch (error) {
    console.error("Create Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const budgets = await pool.query(`SELECT * FROM tblbudget WHERE user_id = $1 ORDER BY start_date DESC`, [userId]);

    res.status(200).json({ status: "success", data: budgets.rows });
  } catch (error) {
    console.error("Get Budgets Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;
    const { category, budget_amount, start_date, end_date } = req.body;

    const updatedBudget = await pool.query(
      `UPDATE tblbudget 
       SET category = $1, budget_amount = $2, start_date = $3, end_date = $4, updatedat = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [category, budget_amount, start_date, end_date, budget_id]
    );

    res.status(200).json({ status: "success", message: "Budget updated", data: updatedBudget.rows[0] });
  } catch (error) {
    console.error("Update Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;

    await pool.query(`DELETE FROM tblbudget WHERE id = $1`, [budget_id]);

    res.status(200).json({ status: "success", message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Delete Budget Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
