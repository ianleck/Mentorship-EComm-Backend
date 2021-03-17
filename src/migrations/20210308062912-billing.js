'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.createTable('Billing', {
        billingId: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        paypalPayerId: {
          type: Sequelize.STRING,
        },
        paypalPaymentId: {
          type: Sequelize.STRING,
        },
        productId: {
          type: Sequelize.UUID,
        },
        contractId: {
          type: Sequelize.UUID,
        },
        amount: {
          type: Sequelize.FLOAT,
          default: '0.00',
        },
        currency: {
          type: Sequelize.STRING,
          default: 'SGD',
        },
        platformFee: {
          type: Sequelize.FLOAT,
        },
        senderWalletId: {
          type: Sequelize.STRING,
        },
        receiverWalletId: {
          type: Sequelize.STRING,
        },
        status: {
          allowNull: false,
          type: Sequelize.ENUM(
            'SUCCESS',
            'FAILED',
            'PENDING_PAYMENT',
            'PENDING_120_DAYS',
            'WITHDRAWN',
            'ADMIN'
          ),
        },
        withdrawableDate: {
          type: Sequelize.DATE,
        },
        withdrawalApplication: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        isCourseBilling: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
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
    return queryInterface.dropTable('Billing');
  },
};
