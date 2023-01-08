const mongoose = require('mongoose');
const LatLngSchema = require('./LatLng').schema;
const PlanSchema = require('./plan').schema;

const GroupSchema = mongoose.Schema({
    group_name : {
        type: String,
        trim: true,
        require: true
    },
    owner: {
        type: String,
        trim: true,
        require: true
    },
    location:{
        type: LatLngSchema
    },
    members : { // must be valid users in the database
        type: [String],
    }, 
    waitlist : {
        type: [String],
    },
    plans: {
        type: [PlanSchema]
    }
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = {"model":Group, "schema": GroupSchema};