import { getMonthName } from "../libs/index.js";
import { pool } from "../libs/database.js";

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

    const transactions = await pool.query({
      text: `SELECT * FROM tbltransaction WHERE user_id = $1 AND createdat BETWEEN $2 AND $3 AND (description ILIKE '%' || $4 || '%' OR status ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%' OR category ILIKE '%' || $4 || '%') ORDER BY id DESC`,
      values: [userId, startDate, endDate, s],
    });

    res.status(200).json({ status: "success", data: transactions.rows });
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

    const transactionsResult = await pool.query({
      text: `SELECT type, SUM(amount) AS totalAmount FROM tbltransaction WHERE user_id = $1 GROUP BY type`,
      values: [userId],
    });

    transactionsResult.rows.forEach((transaction) => {
      if (transaction.type === "income") totalIncome += transaction.totalamount;
      else totalExpense += transaction.totalamount;
    });

    const availableBalance = totalIncome - totalExpense;

    const year = new Date().getFullYear();
    const start_Date = new Date(year, 0, 1);
    const end_Date = new Date(year, 11, 31, 23, 59, 59);

    const result = await pool.query({
      text: `SELECT EXTRACT(MONTH FROM createdat) AS month, type, SUM(amount) AS totalAmount FROM tbltransaction WHERE user_id = $1 AND createdat BETWEEN $2 AND $3 GROUP BY EXTRACT(MONTH FROM createdat), type`,
      values: [userId, start_Date, end_Date],
    });

    const data = new Array(12).fill().map((_, index) => {
      const monthData = result.rows.filter(item => parseInt(item.month) === index + 1);
      const income = parseFloat(monthData.find(item => item.type === "income")?.totalamount || 0);
      const expense = parseFloat(monthData.find(item => item.type === "expense")?.totalamount || 0);

      return { label: getMonthName(index), income, expense };
    });

    const lastTransactions = (await pool.query({
      text: `SELECT * FROM tbltransaction WHERE user_id = $1 ORDER BY id DESC LIMIT 5`,
      values: [userId],
    })).rows;

    const lastAccount = (await pool.query({
      text: `SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY id DESC LIMIT 4`,
      values: [userId],
    })).rows;

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

    const result = await pool.query(`SELECT * FROM tblaccount WHERE id = $1`, [account_id]);
    const accountInfo = result.rows[0];

    if (!accountInfo) {
      return res.status(404).json({ status: "failed", message: "Invalid account information." });
    }

    if (accountInfo.account_balance < Number(amount)) {
      return res.status(403).json({ status: "failed", message: "Insufficient account balance." });
    }

    await pool.query("BEGIN");

    await pool.query(
      `UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2`,
      [amount, account_id]
    );

    const newTransaction = await pool.query(
      `INSERT INTO tbltransaction(user_id, account_id, description, type, status, amount, source, category)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, account_id, description, "expense", "Completed", amount, source, category]
    );

    await pool.query(
      `UPDATE tblbudget SET amount_spent = amount_spent + $1 
       WHERE user_id = $2 AND category = $3`,
      [amount, userId, category]
    );

    await pool.query("COMMIT");

    res.status(200).json({
      status: "success",
      message: "Transaction completed and budget updated.",
      data: newTransaction.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Add Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const editTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { account_id, description, source, amount, category, type, status } = req.body;

    const oldTransactionResult = await pool.query(`SELECT * FROM tbltransaction WHERE id = $1`, [transaction_id]);
    const oldTransaction = oldTransactionResult.rows[0];

    if (!oldTransaction) {
      return res.status(404).json({ status: "failed", message: "Transaction not found." });
    }

    const oldAmount = Number(oldTransaction.amount);
    const newAmount = Number(amount);

    await pool.query("BEGIN");

    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance ${oldTransaction.type === 'income' ? '-' : '+'} $1 WHERE id = $2`,
      values: [oldAmount, oldTransaction.account_id]
    });

    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance ${type === 'income' ? '+' : '-'} $1 WHERE id = $2`,
      values: [newAmount, account_id]
    });

    await pool.query(
      `UPDATE tblbudget SET amount_spent = amount_spent - $1 WHERE user_id = $2 AND category = $3`,
      [oldAmount, oldTransaction.user_id, oldTransaction.category]
    );

    await pool.query(
      `UPDATE tblbudget SET amount_spent = amount_spent + $1 WHERE user_id = $2 AND category = $3`,
      [newAmount, oldTransaction.user_id, category]
    );

    await pool.query(
      `UPDATE tbltransaction 
       SET account_id = $1, description = $2, source = $3, amount = $4, category = $5, type = $6, status = $7, updatedat = CURRENT_TIMESTAMP 
       WHERE id = $8`,
      [account_id, description, source, newAmount, category, type, status, transaction_id]
    );

    await pool.query("COMMIT");

    res.status(200).json({ status: "success", message: "Transaction and account updated successfully." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Edit Transaction Error:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};


export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    await pool.query("BEGIN");

    const transactionResult = await pool.query(`SELECT * FROM tbltransaction WHERE id = $1`, [transactionId]);
    const transaction = transactionResult.rows[0];

    if (!transaction) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.account_id) {
      let balanceUpdateQuery;
      if (transaction.type === 'expense') {
        balanceUpdateQuery = `
          UPDATE tblaccount 
          SET account_balance = account_balance + $1 
          WHERE id = $2
        `;
      } else {
        balanceUpdateQuery = `
          UPDATE tblaccount 
          SET account_balance = account_balance - $1 
          WHERE id = $2
        `;
      }

      await pool.query(balanceUpdateQuery, [
        transaction.amount,
        transaction.account_id
      ]);
    }

    await pool.query(
      `UPDATE tblbudget SET amount_spent = amount_spent - $1 WHERE user_id = $2 AND category = $3`,
      [transaction.amount, transaction.user_id, transaction.category]
    );

    await pool.query(`DELETE FROM tbltransaction WHERE id = $1`, [transactionId]);

    await pool.query("COMMIT");

    res.status(200).json({
      status: "success",
      message: "Transaction deleted and account balance updated",
    });
  } catch (error) {
    await pool.query("ROLLBACK");
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

    const fromAccountResult = await pool.query(`SELECT * FROM tblaccount WHERE id = $1`, [from_account]);
    const fromAccount = fromAccountResult.rows[0];

    if (!fromAccount) {
      return res.status(404).json({ status: "failed", message: "Sender account not found." });
    }

    const toAccountResult = await pool.query(`SELECT * FROM tblaccount WHERE id = $1`, [to_account]);
    const toAccount = toAccountResult.rows[0];

    if (!toAccount) {
      return res.status(404).json({ status: "failed", message: "Receiver account not found." });
    }

    if (newAmount > fromAccount.account_balance) {
      return res.status(403).json({ status: "failed", message: "Insufficient balance." });
    }

    await pool.query("BEGIN");

    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2`,
      values: [newAmount, from_account],
    });

    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance + $1 WHERE id = $2`,
      values: [newAmount, to_account],
    });

    await pool.query({
      text: `INSERT INTO tbltransaction (user_id, account_id, description, type, status, amount, source) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        userId,
        from_account,
        `Transfer to ${toAccount.account_name}`,
        "expense",
        "Completed",
        newAmount,
        fromAccount.account_name,
      ],
    });

    await pool.query({
      text: `INSERT INTO tbltransaction (user_id, account_id, description, type, status, amount, source) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        userId,
        to_account,
        `Received from ${fromAccount.account_name}`,
        "income",
        "Completed",
        newAmount,
        toAccount.account_name,
      ],
    });

    await pool.query("COMMIT");

    res.status(201).json({
      status: "success",
      message: "Transfer completed successfully.",
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const uploadReceipt = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const receiptUrl = req.file.location;

    await pool.query(
      `UPDATE tbltransaction SET receipt_url = $1 WHERE id = $2`,
      [receiptUrl, transaction_id]
    );

    res.status(200).json({ status: 'success', message: 'Receipt uploaded', receiptUrl });
  } catch (error) {
    console.error('Upload Receipt Error:', error);
    res.status(500).json({ status: 'failed', message: error.message });
  }
};
