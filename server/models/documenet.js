"use strict";

export default (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      totalPages: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "documents",
      timestamps: true,
    },
  );

  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Document.belongsTo(models.Conversation, {
      foreignKey: "conversationId",
      onDelete: "CASCADE",
    });
  };

  return Document;
};
