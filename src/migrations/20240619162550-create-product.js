'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true // Allow null in case a product can exist without a category
      },
      name: {
        type: Sequelize.STRING
      },
      price:{
        type:Sequelize.INTEGER
      },
      description:{
        type: Sequelize.STRING
      },

      category_id:{
        type: Sequelize.INTEGER,
      },
      status: { // Adding the status field
        type: Sequelize.INTEGER,
        allowNull: false, // Modify as per your requirement
        defaultValue: 0 // Example default value
      },
      
      count:{
        type: Sequelize.INTEGER,
        allowNull: false, // Modify as per your requirement
        defaultValue: 0 // Example default value
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};