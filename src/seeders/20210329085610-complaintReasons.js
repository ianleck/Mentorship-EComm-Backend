'use strict';
const reasonJson = require('./json/complaintReasons.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.bulkInsert('ComplaintReason', reasonJson, {
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
    return queryInterface.bulkDelete('ComplaintReason', null, {});
  },
};
