module.exports = (sequelize, Sequelize) => {
    const Inquiryproducts = sequelize.define("inquiryproducts", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return Inquiryproducts;
};