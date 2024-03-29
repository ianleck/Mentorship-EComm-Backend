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
        refundRequestId: {
          type: Sequelize.STRING,
        },
        productId: {
          type: Sequelize.UUID,
        },
        contractId: {
          type: Sequelize.UUID,
        },
        amount: {
          allowNull: false,
          type: Sequelize.FLOAT,
          defaultValue: 0.0,
        },
        currency: {
          allowNull: false,
          type: Sequelize.STRING,
          defaultValue: 'SGD',
        },
        mentorPassCount: {
          type: Sequelize.INTEGER,
        },
        platformFee: {
          type: Sequelize.FLOAT,
        },
        senderWalletId: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        receiverWalletId: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        status: {
          allowNull: false,
          type: Sequelize.ENUM(
            'CONFIRMED',
            'FAILED',
            'PAID',
            'PENDING_120_DAYS',
            'PENDING_WITHDRAWAL',
            'REFUNDED',
            'REJECTED',
            'WITHDRAWN',
            'ADMIN'
          ),
        },
        withdrawableDate: {
          type: Sequelize.DATE,
        },
        billingType: {
          allowNull: false,
          type: Sequelize.ENUM(
            'INTERNAL',
            'COURSE',
            'MENTORSHIP',
            'REFUND',
            'WITHDRAWAL'
          ),
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
