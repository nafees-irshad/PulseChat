"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("messages", "model", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("messages", "requestedModel", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("messages", "requestedModel");
    await queryInterface.removeColumn("messages", "model");
  },
};
