import express from "express";
import { addMoneyToAccount, createAccount, getAccounts, getAccountById } from "../controllers/accountController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAccounts);
router.get("/:id", authMiddleware, getAccountById);
router.post("/", authMiddleware, createAccount);
router.put("/add-money/:id", authMiddleware, addMoneyToAccount);

export default router;