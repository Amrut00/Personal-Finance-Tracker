import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: 2
    },
    lastname: {
        type: String,
        required: function() { return !this.googleId && !this.githubId; },
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/ // Basic email validation
    },
    password: {
        type: String,
        required: function() { return !this.googleId && !this.githubId; },
        select: false
    },
    googleId: {
        type: String,
        sparse: true
    },
    googleToken: {
        type: String
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    verified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Category Schema
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'categories'
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    status: {
        type: String,
        required: true,
        enum: ['Completed', 'Pending', 'Failed']
    },
    source: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    receiptUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'transactions'
});

// Budget Schema
const BudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    budgetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    amountSpent: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'budgets'
});

// Account Schema
const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    accountName: {
        type: String,
        required: true,
        trim: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['bank', 'cash', 'credit', 'investment']
    },
    balance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'accounts'
});

// Create models
const User = mongoose.model('User', UserSchema);
const Category = mongoose.model('Category', CategorySchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Account = mongoose.model('Account', AccountSchema);
const Budget = mongoose.model('Budget', BudgetSchema);

// Add custom methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export { User, Category, Transaction, Account, Budget };

// Add indexes for better performance
CategorySchema.index({ userId: 1 });
TransactionSchema.index({ userId: 1 });
AccountSchema.index({ userId: 1 });
TransactionSchema.index({ date: -1 });
