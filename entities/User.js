const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const ProfileSource = require("./ProfileSource");

const dbEngine = new DatabaseEngine();

class User extends Model {}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		emailAddress: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		salt: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		activated: {
			type: DataTypes.INTEGER,
			defaultValue: 0, // 0-awaiting activation, 1-activated, 2-deactivated
		},
		type: {
			type: DataTypes.ENUM,
			values: ["Customer", "Admin"],
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "user",
	}
);

ProfileSource.hasMany(User, {
	foreignKey: {
		name: "profilesourceId",
		allowNull: false,
	},
});

User.belongsTo(ProfileSource, {
	foreignKey: "profilesourceId",
});

module.exports = User;
