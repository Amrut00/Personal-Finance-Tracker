import { getMonthName } from "../libs/index.js";
import { Transaction, Account } from "../database/mongo-schema.js";

export const getTransactions = async (req, res) => {
  try {
    const today = new Date();
    const _sevenDaysAgo = new Date(today);
    _sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];

    const { df, dt, s } = req.query;
    const { userId } = req.body.user;

    const startDate = new Date(df || sevenDaysAgo);
    const endDate = new Date(dt || new Date());

    const transactions = await Transaction.find({
      userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      $or: [
        { description: { $regex: s, $options: 'i' } },
        { status: { $regex: s, $options: 'i' } },
        { source: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ status: "success", data: transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getDashboardInformation = async (req, res) => {
  try {
    const { userId } = req.body.user;
    let totalIncome = 0;
    let totalExpense = 0;

    const transactionsResult = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", totalAmount: { $sum: "$amount" } } }
    ]);

    transactionsResult.forEach((transaction) => {
      if (transaction._id === "income") totalIncome += transaction.totalAmount;
      else totalExpense += transaction.totalAmount;
    });

    const availableBalance = totalIncome - totalExpense;

    const year = new Date().getFullYear();
    const start_Date = new Date(year, 0, 1);
    const end_Date = new Date(year, 11, 31, 23, 59, 59);

    const budgets = await Transaction.aggregate([
      { $match: { userId, createdAt: { $gte: start_Date, $lte: end_Date } } },
      { $group: { _id: { month: { $month: "$createdAt" }, type: "$type" }, totalAmount: { $sum: "$amount" } } }
    ]);

    const data = new Array(12).fill().map((_, index) => {
      const monthData = budgets.filter(item => item._id.month === index + 1);
      const income = parseFloat(monthData.find(item => item._id.type === "income")?.totalAmount || 0);
      const expense = parseFloat(monthData.find(item => item._id.type === "expense")?.totalAmount || 0);

      return { label: getMonthName(index), income, expense };
    });

    const lastTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    try {
      const lastAccount = await Account.find({ userId })
        .sort({ createdAt: -1 })
        .limit(4);
      return lastAccount;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return [];
    }

    res.status(200).json({
      status: "success",
      availableBalance,
      totalIncome,
      totalExpense,
      chartData: data,
      lastTransactions,
      lastAccount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { userId } = req.body.user;
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

    const transaction = new Transaction({
      userId,
      accountId: account_id,
      description,
      type: "expense",
      status: "Completed",
      amount,
      source,
      category
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
      data: newTransaction.rows[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Add Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const editTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { account_id, description, source, amount, category, type, status } = req.body;

    const oldTransaction = await Transaction.findById(transaction_id);

    if (!oldTransaction) {
      return res.status(404).json({ status: "failed", message: "Transaction not found." });
    }

    const oldAmount = Number(oldTransaction.amount);
    const newAmount = Number(amount);

    const editSession = await mongoose.startSession();
    editSession.startTransaction();

    // Update account balances
    const updateOldAccount = await Account.findByIdAndUpdate(
      oldTransaction.account_id,
      { $inc: { balance: oldTransaction.type === 'income' ? -oldAmount : oldAmount } },
      { session: editSession }
    );

    const updateNewAccount = await Account.findByIdAndUpdate(
      account_id,
      { $inc: { balance: type === 'income' ? newAmount : -newAmount } },
      { session: editSession }
    );

    // Update budget for old transaction
    const oldBudget = await Budget.findOne({ userId: oldTransaction.user_id, category: oldTransaction.category });
    if (oldBudget) {
      await Budget.findByIdAndUpdate(
        oldBudget._id,
        { $inc: { amountSpent: -oldAmount } },
        { session }
      );
    }

    // Update budget for new transaction
    const newBudget = await Budget.findOne({ userId: oldTransaction.user_id, category });
    if (newBudget) {
      await Budget.findByIdAndUpdate(
        newBudget._id,
        { $inc: { amountSpent: newAmount } },
        { session }
      );
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
        updatedAt: new Date()
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({ status: "success", message: "Transaction and account updated successfully." });
  } catch (error) {
    await session.abortTransaction();
    console.error("Edit Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};


export const deleteTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { userId } = req.body.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await Transaction.findById(transactionId);

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

      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: transaction.type === 'income' ? -transaction.amount : transaction.amount } },
        { session }
      );
    }

    await Transaction.findByIdAndDelete(transaction._id, { session });

    await session.commitTransaction();

    res.status(200).json({ status: "success", message: "Transaction deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const transferMoneyToAccount = async (req, res) => {
  try {
    const { userId } = req.body.user;
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

    if (newAmount > fromAccount.account_balance) {
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

    const fromTransaction = new Transaction({
      userId,
      accountId: from_account,
      description: `Transfer to ${toAccount.account_name}`,
      type: "expense",
      status: "Completed",
      amount: newAmount,
      source: fromAccount.account_name
    });
    await fromTransaction.save({ session });

    const toTransaction = new Transaction({
      userId,
      accountId: to_account,
      description: `Received from ${fromAccount.account_name}`,
      type: "income",
      status: "Completed",
      amount: newAmount,
      source: toAccount.account_name
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
      { receiptUrl },
      { session }
    );

    res.status(200).json({ status: 'success', message: 'Receipt uploaded', receiptUrl });
  } catch (error) {
    console.error('Upload Receipt Error:', error);
    res.status(500).json({ status: 'failed', message: error.message });
  }
};
