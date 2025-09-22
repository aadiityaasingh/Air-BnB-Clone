const mongoose = require("mongoose");
const schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: string,
    rating: {
        type:number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Review", reviewSchema);