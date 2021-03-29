'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.createTable('ComplaintReason', {
        complaintReasonId: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        reason: {
          type: Sequelize.STRING,
          unique: true,
        },
        description: {
          type: Sequelize.STRING,
        },
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
    return queryInterface.dropTable('ComplaintReason');
  },
};
