const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(process.env.BD, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) return console.log(err);
    console.log('Connected to db');
  });
};
