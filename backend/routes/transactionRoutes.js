import express from "express";
import { addTransaction, deleteTransaction, editTransaction, getDashboardInformation, getTransactions, transferMoneyToAccount, recalculateAccountBalances, fixAccountBalance} from "../controllers/transactionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.get("/dashboard", authMiddleware, getDashboardInformation);
router.post("/add-transaction/:account_id", authMiddleware, addTransaction);
router.put("/transfer-money", authMiddleware, transferMoneyToAccount);
router.put("/edit-transaction/:transaction_id", authMiddleware, editTransaction);
router.delete('/:transaction_id', authMiddleware, deleteTransaction);
router.post("/recalculate-balances", authMiddleware, recalculateAccountBalances);
router.post("/fix-balance/:accountId", authMiddleware, fixAccountBalance);


export default router;