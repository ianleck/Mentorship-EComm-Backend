'use strict';
const categoryJson = require('./json/category.json');
const uuid = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const _categoryJson = categoryJson.map((cat) => ({
      ...cat,
      categoryId: uuid.v4(),
    }));
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.bulkInsert('Category', _categoryJson, {
        transaction: t,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Category', null, {});
  },
};
