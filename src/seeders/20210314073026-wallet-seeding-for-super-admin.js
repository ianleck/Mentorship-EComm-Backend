'use strict';

const { QueryTypes } = require('sequelize');
const uuid = require('uuid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const walletId = uuid.v4();
      await queryInterface.sequelize.query(
        `
        INSERT INTO
        Wallet (
          walletId,
          accountId
        )
        values (
          $1,
          'b2749bba-25da-4ec4-a3ea-1fdb3d7778de'
        )
        `,
        {
          bind: [walletId],
          type: QueryTypes.INSERT,
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `
        UPDATE Admin a 
        SET walletId = $1 
        WHERE a.accountId = 'b2749bba-25da-4ec4-a3ea-1fdb3d7778de'
        `,
        {
          bind: [walletId],
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    });
  },

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
        UPDATE Admin a 
        SET walletId = NULL 
        WHERE a.accountId = 'b2749bba-25da-4ec4-a3ea-1fdb3d7778de'
        `,
        {
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `
      delete from "Wallet" where accountId = 'b2749bba-25da-4ec4-a3ea-1fdb3d7778de';
      `,
        {
          type: QueryTypes.DELETE,
          transaction,
        }
      );
    }),
};
