const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const User = require("./User");

const dbEngine = new DatabaseEngine();

class BVN extends Model {}

BVN.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		bvn: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isNumeric: true,
				len: [11, 11],
			},
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "BVN",
	}
);

User.hasOne(BVN, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
	as: "bvnDetails",
});

BVN.belongsTo(User, {
	foreignKey: "userId",
	as: "user",
});

module.exports = BVN;
