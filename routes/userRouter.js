const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/UserController');

// implementing router
const userRouter = express.Router();

userRouter.post("/signup", authController.signup)
userRouter.post("/login", authController.login)
userRouter.get("/verify/:verificationString", authController.verify)

userRouter.post("/forgot-password", authController.forgotPassword)
userRouter.get("/reset-password/:token", authController.resetPassword)

userRouter.use(authController.protected)

userRouter.get("/my-account", userController.getMe, userController.getMyAccount)
userRouter.patch("/update-my-account", userController.getMe, userController.updateMyAccount)
userRouter.patch("/change-password", authController.updatePassword);

module.exports = userRouter;