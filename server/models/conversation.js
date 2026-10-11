"use strict";

export default (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "conversations",
      timestamps: true,
    },
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Conversation.hasMany(models.Message, {
      foreignKey: "conversationId",
      onDelete: "CASCADE",
    });
  };

  return Conversation;
};
