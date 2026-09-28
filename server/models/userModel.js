"use strict";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "Users", // match whatever your migration created
      timestamps: true,
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Conversation, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    User.hasMany(models.Message, { foreignKey: "userId", onDelete: "CASCADE" });
  };

  return User;
};
