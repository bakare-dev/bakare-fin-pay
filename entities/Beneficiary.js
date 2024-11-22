const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const User = require("./User");
const Currency = require("./Currency");

const dbEngine = new DatabaseEngine();

class Beneficiary extends Model {}

Beneficiary.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		accountNumber: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isNumeric: true,
				len: [10, 20],
			},
		},
		bankName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "beneficiary",
	}
);

User.hasMany(Beneficiary, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
	onDelete: "CASCADE",
});

Beneficiary.belongsTo(User, {
	foreignKey: "userId",
});

module.exports = Beneficiary;
