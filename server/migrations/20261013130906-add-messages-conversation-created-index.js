"use strict";

module.exports = {
  async up(queryInterface) {
    const indexes = await queryInterface.showIndex("messages");

    const indexExists = indexes.some(
      (index) => index.name === "idx_messages_conv_created",
    );

    if (!indexExists) {
      await queryInterface.addIndex(
        "messages",
        [
          "conversationId",
          {
            name: "createdAt",
            order: "DESC",
          },
        ],
        {
          name: "idx_messages_conv_created",
        },
      );
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex("messages");

    const indexExists = indexes.some(
      (index) => index.name === "idx_messages_conv_created",
    );

    if (indexExists) {
      await queryInterface.removeIndex("messages", "idx_messages_conv_created");
    }
  },
};
