const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appErrors');

exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user.id
    next()
})

exports.getMyAccount = catchAsync(async (req, res, next) => {

    const id = req.params.id
    if (!id) {
        return next(new appError("please provide id", 400))
    }
    const user = await User.findById(id).populate("pets")

    if (!user) {
        return next(new appError("invalid id", 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})

exports.updateMyAccount = catchAsync(async (req, res, next) => {

    const id = req.params.id
    const { name, phone, bio, socialMedia, location } = req.body

    if (!id) {
        return next(new appError("please provide id", 400))
    }
    const user = await User.findByIdAndUpdate(id, { name, phone, bio, socialMedia, location }, { new: true })

    if (!user) {
        return next(new appError("invalid id", 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
}) 