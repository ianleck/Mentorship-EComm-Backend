'use strict';
const adminJson = require('./json/admin.json');
const bcrypt = require('bcrypt');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const salt = await bcrypt.genSalt(10);
    let adminJson_ = await Promise.all(
      adminJson.map(async (admin) => {
        const hash = await bcrypt.hash(admin.password, salt);
        return {
          ...admin,
          password: hash,
        };
      })
    );
    return queryInterface.sequelize.transaction(async (t) => {
      return await queryInterface.bulkInsert('Admin', adminJson_, {
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
    return queryInterface.bulkDelete('Admin', null, {});
  },
};
