import express from "express";
import { createBudget, getBudgets, updateBudget, deleteBudget } from "../controllers/budgetController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBudget);        // ➤ Create Budget
router.get("/", authMiddleware, getBudgets);          // ➤ Get All Budgets
router.put("/:budget_id", authMiddleware, updateBudget); // ➤ Update Budget
router.delete("/:budget_id", authMiddleware, deleteBudget); // ➤ Delete Budget

export default router;
