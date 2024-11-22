const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");

const dbEngine = new DatabaseEngine();

class ProfileSource extends Model {}

ProfileSource.init(
	{
		source: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "profilesource",
	}
);

module.exports = ProfileSource;
