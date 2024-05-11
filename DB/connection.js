const mongoose = require('mongoose');
// console.log(process.env.MONGO_URI)
var mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}/${process.env.DB_NAME}`;

//this is mongodb uri string

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoDB);
    console.log('Database Connected '+mongoDB);
  } catch (error) {
    console.log('Connection failed...', error);
  }
};

connectToMongoDB();