const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        reqired: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    recieved: Boolean,
});

module.exports = mongoose.model("message", messageSchema);
