'use strict';
const achievementJson = require('./json/achievement.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.bulkInsert('Achievement', achievementJson, {
        transaction: t,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.bulkDelete('Achievement', null, {});
  },
};
