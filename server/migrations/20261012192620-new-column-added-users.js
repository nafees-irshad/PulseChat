"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "isVerified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "otpHash", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "otpExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "otpExpiresAt");
    await queryInterface.removeColumn("users", "otpHash");
    await queryInterface.removeColumn("users", "isVerified");
  },
};
