module.exports = {
    HOST: "inventory-db",
    USER: "testuser",
    PASSWORD: "testpassword",
    DB: "inventory",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};