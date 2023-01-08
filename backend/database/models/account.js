const mongoose = require('mongoose');
const PlanSchema = require('./plan').schema;
const GroupSchema = require('./group').schema;

const AccountSchema = new mongoose.Schema({
    name : {
        type: String,
        trim: true,
        required: true
    },
    username : {
        type: String,
        trim: true,
        required: true
    },
    password : {
        type: String,
        trim: true,
        required: true,
        minLength: 5
    },
    email : {
        type: String,
        trim: true,
        required: true,
    },
    date_of_birth : {
        type: Date,
        required: false
    },
    plans: {
        type: [PlanSchema],
        require: false
    },
    friends: {
        type: [String],
        default: []
    },
    friend_requests: {
        type: [String],
        default: []
    },
    group_ids: {
        type: [String],
        require: false
    },
    public_info_map: {
        name_b: {
            type: Boolean,
            default: false
        },
        email_b: {
            type: Boolean,
            default: false
        },
        plans_b: {
            type: Boolean,
            default: false
        },
        groups_b: {
            type: Boolean,
            default: false
        }
    }
});

const Account = mongoose.model('Account', AccountSchema);

module.exports = {"model": Account, "schema": AccountSchema};