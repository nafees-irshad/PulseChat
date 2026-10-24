"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("documents");

    if (!columns.originalFile) {
      await queryInterface.addColumn("documents", "originalFile", {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("documents");

    if (columns.originalFile) {
      await queryInterface.removeColumn("documents", "originalFile");
    }
  },
};
