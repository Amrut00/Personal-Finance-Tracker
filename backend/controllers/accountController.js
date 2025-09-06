import { User, Account } from "../database/mongo-schema.js";

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body.user;

    const account = await Account.findById(id).where('userId').equals(userId);

    if (!account) {
      return res.status(404).json({
        status: "failed",
        message: "Account not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        id: account._id,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: accounts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const { name, amount, account_number, account_type } = req.body;

    const accountExist = await Account.findOne({ accountNumber: account_number, userId });

    if (accountExist) {
      return res
        .status(409)
        .json({ status: "failed", message: "Account already created." });
    }

    const account = new Account({
      userId,
      accountNumber: account_number,
      accountType: account_type,
      accountName: name,
      balance: amount,
      status: 'active'
    });
    await account.save();

    await User.findByIdAndUpdate(userId, {
      $push: { accounts: account._id }
    });

    const description = account.accountName + " (Initial Deposit)";

    const transaction = new Transaction({
      userId,
      description,
      type: "income",
      status: "Completed",
      amount,
      source: account.accountName
    });
    await transaction.save();

    res.status(201).json({
      status: "success",
      message: account.accountName + " Account created successfully",
      data: {
        id: account._id,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const addMoneyToAccount = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const { amount } = req.body;

    const newAmount = Number(amount);

    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid amount. Please provide a positive number."
      });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({
        status: "failed",
        message: "Account not found"
      });
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { $inc: { balance: newAmount }, updatedAt: new Date() },
      { new: true }
    );

    const description = updatedAccount.accountName + " (Deposit)";

    const transaction = new Transaction({
      userId,
      description,
      type: "income",
      status: "Completed",
      amount,
      source: account.accountName
    });
    await transaction.save();

    res.status(200).json({
      status: "success",
      message: account.accountName + " Deposit completed successfully",
      data: {
        id: account._id,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};