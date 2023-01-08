const mongoose = require('mongoose');
const LatLngSchema = require('./LatLng').schema;

/*
Plan:
    - title : String                the name of the plan
    - route : [{Decimal, Decimal}]  a set of location-points on the route & other information
    - completed : Boolean           whether the plan has been completed
*/

const PlanSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    location_details: {
        type: String,
        trim: true
    },
    frequency: {
        type: String,
        trim: true
    },
    time: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String
    },
    route: {
        zoom : Number,
        center: LatLngSchema,
        points: {
            type: [LatLngSchema],
            default : []
        }
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    public: {
        type: Boolean,
        default: false,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

module.exports = {"schema": PlanSchema};