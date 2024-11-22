const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const User = require("./User");
const Currency = require("./Currency");

const dbEngine = new DatabaseEngine();

class Wallet extends Model {}

Wallet.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		wallet: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "wallet",
	}
);

User.hasMany(Wallet, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
});

Wallet.belongsTo(User, {
	foreignKey: "userId",
});

Currency.hasMany(Wallet, {
	foreignKey: {
		name: "currencyId",
		allowNull: false,
	},
});

Wallet.belongsTo(Currency, {
	foreignKey: "currencyId",
});

module.exports = Wallet;
