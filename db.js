const { Sequelize } = require("sequelize");

const { db } = require("./config");

const sequelize = new Sequelize(db.url, {
  logging: false,
});

module.exports.connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");
  } catch (error) {
    console.error("Failed to connect to DB", error);
    throw error;
  }
};

module.exports.syncModels = async () => {
  const { Authentication } = require("./models/Authentication");

  await Authentication.sync();
};

module.exports.sequelize = sequelize;
