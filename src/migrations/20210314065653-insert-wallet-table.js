'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'Wallet',
        {
          walletId: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          ownerId: {
            allowNull: false,
            unique: true,
            type: Sequelize.UUID,
          },
          pendingAmount: {
            allowNull: false,
            type: Sequelize.FLOAT,
            defaultValue: 0.0,
          },
          confirmedAmount: {
            allowNull: false,
            type: Sequelize.FLOAT,
            defaultValue: 0.0,
          },
          currency: {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: 'SGD',
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
            paranoid: true,
          },
        },
        { transaction }
      );
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('Wallet', { transaction });
    });
  },
};
