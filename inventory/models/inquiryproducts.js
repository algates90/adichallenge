module.exports = (sequelize, Sequelize) => {
    const Inquiryproducts = sequelize.define("inquiryproducts", {
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        inquiryId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        productId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return Inquiryproducts;
};