"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // OTP columns were already created by:
    // 20261012192620-new-column-added-users
    // No additional changes required.
  },

  async down(queryInterface, Sequelize) {
    // No changes to reverse.
    // The earlier migration owns these columns.
  },
};
