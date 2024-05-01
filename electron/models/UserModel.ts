// Insert the MongoDB URI for your private User database in place of the example URI provided below.
const MONGO_URI = 'mongodb+srv://msofiasarhiri:89l3un6TQvGJOGh8@axo-cluster.uazpijv.mongodb.net/';

const mongoose = require('mongoose');

const userDB = mongoose.createConnection(MONGO_URI);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  services: [],
  mode: { type: String, default: 'light' },
});

const UserModel = userDB.model('users', userSchema);
module.exports = UserModel;
