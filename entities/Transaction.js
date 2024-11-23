const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const Currency = require("./Currency");
const User = require("./User");

const dbEngine = new DatabaseEngine();

class Transaction extends Model {}

Transaction.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 6),
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		ref: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM("Debit", "Credit"),
			allowNull: false,
		},
		mode: {
			type: DataTypes.ENUM("Card", "Wallet"),
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("Processing", "Successful", "Failed"),
			defaultValue: "Processing",
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "transaction",
	}
);

Currency.hasMany(Transaction, {
	foreignKey: {
		name: "currencyId",
		allowNull: false,
	},
});

Transaction.belongsTo(Currency, {
	foreignKey: "currencyId",
});

User.hasMany(Transaction, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
});

Transaction.belongsTo(User, {
	foreignKey: "userId",
});

module.exports = Transaction;
