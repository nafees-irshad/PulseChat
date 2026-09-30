"use strict";

const modelNames = {
  gemini: "Gemini Flash",
  groq: "GPT-oss",
  glm: "Dots_Studio",
  liquid: "Liquid-AI",
};

module.exports = {
  async up(queryInterface) {
    for (const [modelId, modelName] of Object.entries(modelNames)) {
      await queryInterface.sequelize.query(
        "UPDATE messages SET model = :modelName WHERE model = :modelId",
        { replacements: { modelId, modelName } },
      );
      await queryInterface.sequelize.query(
        "UPDATE messages SET requestedModel = :modelName WHERE requestedModel = :modelId",
        { replacements: { modelId, modelName } },
      );
    }
  },

  async down(queryInterface) {
    for (const [modelId, modelName] of Object.entries(modelNames)) {
      await queryInterface.sequelize.query(
        "UPDATE messages SET model = :modelId WHERE model = :modelName",
        { replacements: { modelId, modelName } },
      );
      await queryInterface.sequelize.query(
        "UPDATE messages SET requestedModel = :modelId WHERE requestedModel = :modelName",
        { replacements: { modelId, modelName } },
      );
    }
  },
};
