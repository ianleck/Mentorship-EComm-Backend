'use strict';

const { QueryTypes } = require('sequelize');

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

      await queryInterface.sequelize.query(
        `
        INSERT INTO
        Wallet (
          walletId,
          ownerId
        )
        values (
          UUID(),
          $1
        )
        `,
        {
          bind: [superAdminId[0][0].accountId],
          type: QueryTypes.INSERT,
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
      delete from "Wallet" where ownerId = $1;
      `,
        {
          bind: [superAdminId[0][0].accountId],
          type: QueryTypes.INSERT,
          transaction,
        }
      );
    }),
};
