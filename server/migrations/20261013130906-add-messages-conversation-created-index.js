"use strict";

export async function up(queryInterface) {
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

export async function down(queryInterface) {
  await queryInterface.removeIndex("messages", "idx_messages_conv_created");
}
