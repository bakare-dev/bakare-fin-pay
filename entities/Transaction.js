const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");

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
			type: DataTypes.DECIMAL(10, 2),
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
		status: {
			type: DataTypes.ENUM("Processing", "Success", "Failed"),
			defaultValue: "Processing",
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "transaction",
	}
);

module.exports = Transaction;
