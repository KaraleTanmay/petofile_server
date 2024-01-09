const mongoose = require("mongoose");
const validator = require("validator");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [20, "only 20 characters are allowed"]
    },
    bio: {
        type: String,
    },
    location: String,
    socialMedia: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: 'user',
    },
    email: {
        type: String,
        unique: true,
        required: [true, "email is necessary"],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "entered email is not valid"],
    },
    phone: {
        type: String

    },
    password: {
        type: String,
        required: [true, "user must have password"],
        minlength: [8, "password should have atleast 8 characters"],
        select: false,
    },
    pets: [{
        type: mongoose.Schema.ObjectId,
        ref: "Pet"
    }],
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    verificationString: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isDirectModified("password") || this.isNew) {
        return next();
    }
    next();
});

// userSchema.pre(/^find/, function (next) {
//     this.find().select("-password -role -passwordResetToken -passwordResetExpires -verificationString");
//     next();
// });

userSchema.methods.checkPassword = async function (
    candidatePassword,
    userpassword
) {
    return await bcrypt.compare(candidatePassword, userpassword);
};



userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
