const mongoose = require("mongoose");
const mongoUri = "mongodb://admin:admin@localhost:27020/?authMechanism=DEFAULT";

const connectMongo = () => {
  mongoose.connect(mongoUri, () => {
    console.log("Connect To Mongo...!");
  });
};

module.exports = connectMongo;
