const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lockSchema = new Schema({
    name: {
        type: String,
        index: true,
        unique: true
    },
    expireAt: {
        type: Date,
        default: undefined
    }
}, {
    timestamps: true
});

lockSchema.index({
    "expireAt": 1
}, {
    expireAfterSeconds: 0
});

module.exports = lockSchema;