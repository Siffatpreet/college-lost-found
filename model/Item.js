const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["lost", "found"],
            required: true
        },

        itemName: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        photo: {
            type: String,
            required: function () {
                return this.type === "found";
            },
            default: ""
        },

        contact: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Item", itemSchema);