const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: '0',

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.products = require("./products.js")(sequelize, Sequelize);
db.inquiry = require("./inquiry.js")(sequelize, Sequelize);
db.inquiryproducts = require("./inquiryproducts.js")(sequelize, Sequelize);

db.products.hasMany(db.inquiryproducts, {
    foreignKey: 'productId',
});
db.inquiryproducts.belongsTo(db.products, {
    foreignKey: 'productId',
});

db.inquiry.hasMany(db.inquiryproducts, {
    foreignKey: 'inquiryId',
});
db.inquiryproducts.belongsTo(db.inquiry, {
    foreignKey: 'inquiryId',
});


module.exports = db;