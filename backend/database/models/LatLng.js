const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LatLngSchema = new mongoose.Schema({
    lat: Schema.Types.Decimal128, 
    lng: Schema.Types.Decimal128
});

module.exports = {"schema": LatLngSchema};