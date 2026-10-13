"use strict";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otpHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users", // match whatever your migration created
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
