"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("messages");

    if (!columns.thoughtTimeMs) {
      await queryInterface.addColumn("messages", "thoughtTimeMs", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("messages");

    if (columns.thoughtTimeMs) {
      await queryInterface.removeColumn("messages", "thoughtTimeMs");
    }
  },
};
