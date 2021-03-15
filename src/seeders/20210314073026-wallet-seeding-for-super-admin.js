'use strict';

const { QueryTypes } = require('sequelize');
const uuid = require('uuid');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const superAdminId = await queryInterface.sequelize.query(
        `
        SELECT accountId
        FROM Admin a
        WHERE a.username = "superAdmin1"
        `
      );
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
          $2
        )
        `,
        {
          bind: [walletId, superAdminId[0][0].accountId],
          type: QueryTypes.INSERT,
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `
        UPDATE Admin a 
        SET walletId = $1 
        WHERE a.accountId = $2
        `,
        {
          bind: [walletId, superAdminId[0][0].accountId],
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    });
  },

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      const superAdminId = await queryInterface.sequelize.query(
        `
        SELECT accountId
        FROM Admin a
        WHERE a.username = "superAdmin1"
        `
      );
      await queryInterface.sequelize.query(
        `
        UPDATE Admin a 
        SET walletId = NULL 
        WHERE a.accountId = $1
        `,
        {
          bind: [superAdminId[0][0].accountId],
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `
      delete from "Wallet" where accountId = $1;
      `,
        {
          bind: [superAdminId[0][0].accountId],
          type: QueryTypes.DELETE,
          transaction,
        }
      );
    }),
};
