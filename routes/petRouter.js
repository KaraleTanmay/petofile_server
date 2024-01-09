const express = require('express');
const authController = require('../controllers/authController');
const petController = require('../controllers/petController');

// implementing router
const petRouter = express.Router();

petRouter.use(authController.protected);

petRouter
    .route("/")
    .get(petController.getAllPets)
    .post(petController.createPet)

petRouter.use(authController.protected)
petRouter.get("/:id", petController.getPetById)

module.exports = petRouter;