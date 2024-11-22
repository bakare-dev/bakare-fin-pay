const { Model, DataTypes } = require("sequelize");
const DatabaseEngine = require("../utils/DatabaseEngine");
const User = require("./User");
const Currency = require("./Currency");

const dbEngine = new DatabaseEngine();

class Notification extends Model {}

Notification.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		read: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		sequelize: dbEngine.getConnectionManager(),
		modelName: "notification",
	}
);

User.hasMany(Notification, {
	foreignKey: {
		name: "userId",
		allowNull: false,
	},
});

Notification.belongsTo(User, {
	foreignKey: "userId",
});

module.exports = Notification;
