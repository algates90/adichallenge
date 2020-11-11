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

db.products.belongsToMany(db.inquiry, { through: db.inquiryproducts });
db.inquiry.belongsToMany(db.products, { through: db.inquiryproducts });

module.exports = db;