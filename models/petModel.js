const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "unnamed",
        maxlength: [20, "only 20 characters are allowed"]
    },
    profile: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: {
            values: ["exotic", "bird", "aquatic", "domestic", "other"],
            message: "only exotic, bird, aquatic, domestic and other are allowed"
        },
        required: true
    },
    species: {
        type: String,
        required: true
    },
    breed: String,
    age: {
        type: Number,
    },
    lifeStage: {
        type: String,
        enum: {
            values: ["newborn", "young", "adult"],
            message: "only newborn, young and adult are allowed"
        },
        required: true
    },

    gender: {
        type: String,
        enum: {
            values: ["male", "female", "unknown"],
            message: "only male, female, and unknown are allowed"
        },
        required: true
    },
    size: {
        type: String,
        enum: {
            values: ["small", "medium", "large"],
            message: "only small, medium, and large are allowed"
        },
        required: true
    },

    color: String,

    temperament: {
        type: String,
        enum: {
            values: ["friendly", "playful", "calm", "energetic", "protective", "independent", "aggressive"],
            message: "only friendly, playful, calm, energetic, protective, independent, and aggressive are allowed"
        },
    },
    specialFeatures: String,
    healthStatus: {
        type: String,
        enum: {
            values: ["excellent", "good", "poor"],
            message: "only excellent, good, and poor are allowed"
        },
        required: true
    },
    isVaccinated: {
        type: Boolean,
        default: false,
        required: true
    },
    isSpayedOrNeutered: {
        type: Boolean,
        default: false
    },
    dietaryNeeds: String,
    exerciseRequirements: String,
    trainingLevel: {
        type: Boolean,
        default: false,
        required: true
    },
    description: {
        type: String,
        maxlength: [300, "only 300 characters are allowed"]
    },
    adoptionFee: {
        type: Number,
        required: true
    },
    isAvailableForAdoption: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    location: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
    },
}, {
    versionKey: false
});


const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;

module.exports = Pet;

