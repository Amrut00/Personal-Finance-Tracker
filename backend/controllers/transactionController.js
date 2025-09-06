import { getMonthName } from "../libs/index.js";
import { Transaction, Account, Category, Budget } from "../database/mongo-schema.js";
import mongoose from "mongoose";

export const getTransactions = async (req, res) => {
  try {
    const today = new Date();
    const _sevenDaysAgo = new Date(today);
    _sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];

    const { df, dt, s } = req.query;
    const { userId } = req.user;

    const startDate = new Date(df || sevenDaysAgo);
    const endDate = new Date(dt || new Date());
    
    // If a specific end date is provided, set it to end of day
    if (dt) {
      endDate.setHours(23, 59, 59, 999);
    }

    let query = {
      userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Only add search filter if search parameter is provided and not empty
    if (s && s.trim() !== '') {
      query.$or = [
        { description: { $regex: s, $options: 'i' } },
        { status: { $regex: s, $options: 'i' } },
        { source: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    res.status(200).json({ status: "success", data: transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};


export const getDashboardInformation = async (req, res) => {
  try {
    const { userId } = req.user;
    let totalIncome = 0;
    let totalExpense = 0;

    const transactionsResult = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
    ]);

    transactionsResult.forEach((transaction) => {
      if (transaction._id === "income") {
        totalIncome += transaction.totalAmount;
      } else if (transaction._id === "expense") {
        totalExpense += transaction.totalAmount;
      }
    });

    const availableBalance = totalIncome - totalExpense;

    const year = new Date().getFullYear();
    const start_Date = new Date(year, 0, 1);
    const end_Date = new Date(year, 11, 31, 23, 59, 59);

    const chartDataAggregation = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: start_Date, $lte: end_Date } } },
      { $group: { _id: { month: { $month: "$createdAt" }, type: "$type" }, totalAmount: { $sum: "$amount" } } }
    ]);

    const data = new Array(12).fill().map((_, index) => {
      const monthData = chartDataAggregation.filter(item => item._id.month === index + 1);
      const income = parseFloat(monthData.find(item => item._id.type === "income")?.totalAmount || 0);
      const expense = parseFloat(monthData.find(item => item._id.type === "expense")?.totalAmount || 0);

      return { label: getMonthName(index), income, expense };
    });

    const lastTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    let lastAccount = [];
    try {
      lastAccount = await Account.find({ userId })
        .sort({ createdAt: -1 })
        .limit(4);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      lastAccount = [];
    }

    res.status(200).json({
      status: "success",
      data: {
        availableBalance,
        totalIncome,
        totalExpense,
        chartData: data,
        lastTransactions,
        lastAccount,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { userId } = req.user;
    const account_id = req.params.account_id || req.body.account_id;
    const { description, source, amount, category } = req.body;

    if (!(description && source && amount && category && account_id)) {
      return res.status(403).json({
        status: "failed",
        message: "Provide Required Fields!",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(403).json({
        status: "failed",
        message: "Amount should be greater than 0.",
      });
    }

    const account = await Account.findById(account_id);
    if (!account) {
      return res.status(404).json({ status: "failed", message: "Invalid account information." });
    }

    if (account.balance < Number(amount)) {
      return res.status(403).json({ status: "failed", message: "Insufficient account balance." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    await Account.findByIdAndUpdate(
      account_id,
      { $inc: { balance: -amount } },
      { session }
    );

    // Find or create category
    let transactionCategory = await Category.findOne({ 
      name: category, 
      type: "expense", 
      userId 
    });
    
    if (!transactionCategory) {
      transactionCategory = new Category({
        name: category,
        type: "expense",
        userId
      });
      await transactionCategory.save();
    }

    const transaction = new Transaction({
      userId,
      accountId: account_id,
      description,
      type: "expense",
      status: "Completed",
      amount,
      source,
      category,
      categoryId: transactionCategory._id
    });
    await transaction.save({ session });

    const budget = await Budget.findOne({ userId, category });
    if (budget) {
      await Budget.findByIdAndUpdate(
        budget._id,
        { $inc: { amountSpent: amount } },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      message: "Transaction completed and budget updated.",
      data: transaction,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Add Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const editTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { account_id, description, source, amount, category, type, status } = req.body;

    if (!account_id) {
      return res.status(400).json({ status: "failed", message: "Account ID is required." });
    }

    const oldTransaction = await Transaction.findById(transaction_id);

    if (!oldTransaction) {
      return res.status(404).json({ status: "failed", message: "Transaction not found." });
    }

    const oldAmount = Number(oldTransaction.amount);
    const newAmount = Number(amount);

    const editSession = await mongoose.startSession();
    editSession.startTransaction();

    // Update account balances

    // Revert the old transaction's effect on the old account
    if (oldTransaction.accountId) {
      await Account.findByIdAndUpdate(
        oldTransaction.accountId,
        { $inc: { balance: oldTransaction.type === 'income' ? -oldAmount : oldAmount } },
        { session: editSession }
      );
    }

    // Apply the new transaction's effect on the new account
    if (account_id) {
      await Account.findByIdAndUpdate(
        account_id,
        { $inc: { balance: type === 'income' ? newAmount : -newAmount } },
        { session: editSession }
      );
    }

    // Update budget for old transaction
    const oldBudget = await Budget.findOne({ userId: oldTransaction.userId, category: oldTransaction.category });
    if (oldBudget) {
      await Budget.findByIdAndUpdate(
        oldBudget._id,
        { $inc: { amountSpent: -oldAmount } },
        { session: editSession }
      );
    }

    // Update budget for new transaction
    const newBudget = await Budget.findOne({ userId: oldTransaction.userId, category });
    if (newBudget) {
      await Budget.findByIdAndUpdate(
        newBudget._id,
        { $inc: { amountSpent: newAmount } },
        { session: editSession }
      );
    }

    // Find or create category for new transaction
    let newTransactionCategory = await Category.findOne({ 
      name: category, 
      type: type, 
      userId: oldTransaction.userId 
    });
    
    if (!newTransactionCategory) {
      newTransactionCategory = new Category({
        name: category,
        type: type,
        userId: oldTransaction.userId
      });
      await newTransactionCategory.save();
    }

    // Update transaction
    await Transaction.findByIdAndUpdate(
      transaction_id,
      {
        accountId: account_id,
        description,
        source,
        amount: newAmount,
        category,
        type,
        status,
        categoryId: newTransactionCategory._id,
        updatedAt: new Date()
      },
      { session: editSession }
    );

    await editSession.commitTransaction();

    res.status(200).json({ status: "success", message: "Transaction and account updated successfully." });
  } catch (error) {
    await editSession.abortTransaction();
    console.error("Edit Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};


export const deleteTransaction = async (req, res) => {
  let session;
  try {
    const { transaction_id } = req.params;
    const { userId } = req.user;

    session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await Transaction.findById(transaction_id);

    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ status: "failed", message: "Transaction not found" });
    }

    if (transaction.accountId) {
      const account = await Account.findById(transaction.accountId);
      if (!account) {
        await session.abortTransaction();
        return res.status(404).json({ status: "failed", message: "Account not found" });
      }

      const budget = await Budget.findOne({ userId, category: transaction.category });
      if (budget) {
        await Budget.findByIdAndUpdate(
          budget._id,
          { $inc: { amountSpent: -transaction.amount } },
          { session }
        );
      }

      // Reverse the transaction effect on account balance
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;

      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: balanceChange } },
        { session }
      );
    }

    await Transaction.findByIdAndDelete(transaction._id, { session });

    await session.commitTransaction();

    res.status(200).json({ status: "success", message: "Transaction deleted successfully" });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Delete Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Function to recalculate account balances based on transactions
export const recalculateAccountBalances = async (req, res) => {
  try {
    const { userId } = req.user;
    
    console.log("Recalculating account balances for user:", userId);
    
    // Get all accounts for the user
    const accounts = await Account.find({ userId });
    
    for (const account of accounts) {
      // Get all transactions for this account
      const transactions = await Transaction.find({ 
        userId, 
        accountId: account._id 
      });
      
      // Calculate the correct balance
      let calculatedBalance = 0;
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          calculatedBalance += transaction.amount;
        } else {
          calculatedBalance -= transaction.amount;
        }
      });
      
      console.log(`Account ${account.accountName}:`, {
        currentBalance: account.balance,
        calculatedBalance: calculatedBalance,
        transactionCount: transactions.length
      });
      
      // Update the account balance
      await Account.findByIdAndUpdate(account._id, { 
        balance: calculatedBalance 
      });
    }
    
    res.status(200).json({ 
      status: "success", 
      message: "Account balances recalculated successfully" 
    });
  } catch (error) {
    console.error("Recalculate balances error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Quick fix for account balance issues
export const fixAccountBalance = async (req, res) => {
  try {
    const { userId } = req.user;
    const { accountId } = req.params;
    
    console.log("Fixing account balance for:", accountId);
    
    // Get the account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ status: "failed", message: "Account not found" });
    }
    
    // Get all transactions for this account
    const transactions = await Transaction.find({ 
      userId, 
      accountId: account._id 
    });
    
    // Calculate the correct balance
    let calculatedBalance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        calculatedBalance += transaction.amount;
      } else {
        calculatedBalance -= transaction.amount;
      }
    });
    
    console.log(`Fixing account ${account.accountName}:`, {
      currentBalance: account.balance,
      calculatedBalance: calculatedBalance,
      transactionCount: transactions.length
    });
    
    // Update the account balance
    await Account.findByIdAndUpdate(account._id, { 
      balance: calculatedBalance 
    });
    
    res.status(200).json({ 
      status: "success", 
      message: `Account balance fixed. New balance: ${calculatedBalance}`,
      data: {
        accountName: account.accountName,
        oldBalance: account.balance,
        newBalance: calculatedBalance
      }
    });
  } catch (error) {
    console.error("Fix account balance error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const transferMoneyToAccount = async (req, res) => {
  try {
    const { userId } = req.user;
    const { from_account, to_account, amount } = req.body;

    if (!(from_account && to_account && amount)) {
      return res.status(403).json({ status: "failed", message: "Provide Required Fields!" });
    }

    const newAmount = Number(amount);

    if (newAmount <= 0) {
      return res.status(403).json({ status: "failed", message: "Amount should be greater than 0." });
    }

    const fromAccountResult = await Account.findById(from_account);
    const fromAccount = fromAccountResult;

    if (!fromAccount) {
      return res.status(404).json({ status: "failed", message: "Sender account not found." });
    }

    const toAccountResult = await Account.findById(to_account);
    const toAccount = toAccountResult;

    if (!toAccount) {
      return res.status(404).json({ status: "failed", message: "Receiver account not found." });
    }

    if (newAmount > fromAccount.balance) {
      return res.status(403).json({ status: "failed", message: "Insufficient balance." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    await Account.findByIdAndUpdate(
      from_account,
      { $inc: { balance: -newAmount } },
      { session }
    );

    await Account.findByIdAndUpdate(
      to_account,
      { $inc: { balance: newAmount } },
      { session }
    );

    // Find or create Transfer categories
    let transferOutCategory = await Category.findOne({ 
      name: "Transfer Out", 
      type: "expense", 
      userId 
    });
    
    if (!transferOutCategory) {
      transferOutCategory = new Category({
        name: "Transfer Out",
        type: "expense",
        userId
      });
      await transferOutCategory.save();
    }

    let transferInCategory = await Category.findOne({ 
      name: "Transfer In", 
      type: "income", 
      userId 
    });
    
    if (!transferInCategory) {
      transferInCategory = new Category({
        name: "Transfer In",
        type: "income",
        userId
      });
      await transferInCategory.save();
    }

    const fromTransaction = new Transaction({
      userId,
      accountId: from_account,
      description: `Transfer to ${toAccount.accountName}`,
      type: "expense",
      status: "Completed",
      amount: newAmount,
      source: fromAccount.accountName,
      category: "Transfer Out",
      categoryId: transferOutCategory._id
    });
    await fromTransaction.save({ session });

    const toTransaction = new Transaction({
      userId,
      accountId: to_account,
      description: `Received from ${fromAccount.accountName}`,
      type: "income",
      status: "Completed",
      amount: newAmount,
      source: toAccount.accountName,
      category: "Transfer In",
      categoryId: transferInCategory._id
    });
    await toTransaction.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      status: "success",
      message: "Transfer completed successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const uploadReceipt = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const receiptUrl = req.file.location;

    await Transaction.findByIdAndUpdate(
      transaction_id,
      { receiptUrl }
    );

    res.status(200).json({ status: 'success', message: 'Receipt uploaded', receiptUrl });
  } catch (error) {
    console.error('Upload Receipt Error:', error);
    res.status(500).json({ status: 'failed', message: error.message });
  }
};
