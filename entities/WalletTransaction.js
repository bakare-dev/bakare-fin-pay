const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const Transaction = require("./Transaction");
const Wallet = require("./Wallet");

const dbEngine = new DatabaseEngine();

class WalletTransaction extends Model {}

WalletTransaction.init(
	{},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "wallettransaction",
	}
);

Transaction.hasOne(WalletTransaction, {
	foreignKey: {
		name: "transactionId",
		allowNull: false,
	},
	as: "wallettransactions",
});

WalletTransaction.belongsTo(Transaction, {
	foreignKey: "transactionId",
});

Wallet.hasMany(WalletTransaction, {
	foreignKey: {
		name: "walletId",
		allowNull: false,
	},
	as: "wallettransactions",
});

WalletTransaction.belongsTo(Wallet, {
	foreignKey: "walletId",
});

module.exports = WalletTransaction;
