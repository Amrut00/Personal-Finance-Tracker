import express from "express";
import { createBudget, getBudgets, updateBudget, deleteBudget } from "../controllers/budgetController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBudget);       
router.get("/", authMiddleware, getBudgets);        
router.put("/:budget_id", authMiddleware, updateBudget); 
router.delete("/:budget_id", authMiddleware, deleteBudget); 

export default router;
