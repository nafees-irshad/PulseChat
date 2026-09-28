'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('messages', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    conversationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    role: {
      type: Sequelize.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },

    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('messages');

  // Required for MySQL when using ENUM
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS `messages_role`'
  );
}