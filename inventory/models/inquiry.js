module.exports = (sequelize, Sequelize) => {
    const Inquiry = sequelize.define("inquiry", {
        validUntil: {
            type: Sequelize.DATE,
            allowNull: false
        },
        isquantityadapted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isconfirmed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    });

    return Inquiry;
};