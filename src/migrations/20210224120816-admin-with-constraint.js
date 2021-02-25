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
      return await queryInterface
        .createTable('Admin', {
          accountId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          username: {
            type: Sequelize.STRING,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
          },
          firstName: {
            type: Sequelize.STRING,
          },
          lastName: {
            type: Sequelize.STRING,
          },
          emailVerified: {
            type: Sequelize.BOOLEAN,
          },
          email: {
            type: Sequelize.STRING,
          },
          contactNumber: {
            type: Sequelize.STRING,
          },
          status: {
            type: Sequelize.ENUM('ACTIVE', 'BANNED'),
            defaultValue: 'ACTIVE',
          },
          paypalId: {
            type: Sequelize.STRING,
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
          userType: {
            type: Sequelize.ENUM('STUDENT', 'SENSEI', 'ADMIN'),
          },
          permission: {
            type: Sequelize.ENUM('ADMIN', 'SUPERADMIN'),
            defaultValue: 'ADMIN',
          },
          updatedBy: {
            type: Sequelize.UUID,
          },
        })
        .then(async () => {
          return await queryInterface.addConstraint(
            'Admin',
            {
              type: 'foreign key',
              fields: ['updatedBy'],
              references: {
                table: 'Admin',
                field: 'accountId',
              },
              onDelete: 'no action',
              onUpdate: 'no action',
            },
            {
              transaction: t,
            }
          );
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
    return queryInterface.dropTable('Admin');
  },
};
