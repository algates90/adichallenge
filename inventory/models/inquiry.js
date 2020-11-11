module.exports = (sequelize, Sequelize) => {
    const Inquiry = sequelize.define("inquiry", {
        validUntil: {
            type: Sequelize.DATE,
            allowNull: false
        }
    });

    return Inquiry;
};