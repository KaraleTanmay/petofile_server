const Pet = require("../models/petModel");
const User = require("../models/userModel");
const appError = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");

exports.getAllPets = catchAsync(async (req, res, next) => {

    const queryString = req.query

    // queries
    let query = req.query;
    const queryObj = { ...query };
    const exclude = ["page", "sort"];
    exclude.forEach((element) => {
        delete queryObj[element];
    })

    // advanced filtering 
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);

    query = JSON.parse(queryStr);

    // sorting
    let sortBy
    if (queryString.sort) {
        // const sortBy = req.query.sort.replace(","," ");
        sortBy = queryString.sort.replace(",", " ");
    }
    else {
        sortBy = "createdAt";
    }

    // paginating
    const page = queryString.page * 1 || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const pets = await Pet.find(query).sort(sortBy).skip(skip).limit(limit).select("name species breed lifeStage gender profile adoptionFee")


    res.status(200).json({
        status: "success",
        results: pets.length,
        data: {
            user: req.user,
            pets
        }
    })
})

exports.getPetById = catchAsync(async (req, res, next) => {

    const id = req.params.id
    if (!id) {
        return next(new appError("please provide the id", 400));
    }

    const pet = await Pet.findById(id).populate("owner", "-password -verificationString -isVerified")
    if (!pet) {
        return next(new appError("invalid id", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user: req.user,
            pet
        }
    })
})



exports.createPet = catchAsync(async (req, res, next) => {

    req.body.owner = req.user.id

    const pet = await Pet.create(req.body)
    if (pet) {
        const user = await User.findById(req.user.id)
        user.pets = [...user.pets, pet.id]
        await user.save()
    }

    res.status(200).json({
        status: "success",
        data: {
            pet
        }
    })
})