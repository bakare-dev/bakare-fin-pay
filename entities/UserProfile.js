const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const User = require("./User");

const dbEngine = new DatabaseEngine();

class UserProfile extends Model {}

UserProfile.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phoneNumber: {
			type: DataTypes.STRING,
		},
		pictureUrl: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "userprofile",
	}
);

User.hasOne(UserProfile, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
});

UserProfile.belongsTo(User, {
	foreignKey: "userId",
});

module.exports = UserProfile;
