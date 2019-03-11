var mongoose  = require("mongoose");

var companySchema = new mongoose.Schema({
  name      : String,
  logo      : String,
  flag      : String,
  value     : String,
  comment   : String,
  founded   : String,
  became    : String,

});
module.exports = mongoose.model("Company", companySchema);
