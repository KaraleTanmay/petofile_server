const express = require('express');
const morgan = require('morgan');
const errorController = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const appError = require('./utils/appErrors');
const cors = require("cors");
const petRouter = require('./routes/petRouter');

// creating app using express instance
const app = express();

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

// adding middleware to acces body of post requests
app.use(express.json())

// logger middleware
if (process.env.node_env === 'developement') {
    app.use(morgan("dev"));
}

app.use("/users", userRouter)
app.use("/pets", petRouter)

// invalid routes handler
app.all("*", (req, res, next) => {
    next(new appError(`requested route ${req.originalUrl} is not available on this server`, 404));
})

// errorcontroller middleware
app.use(errorController);

// listening to the server
module.exports = app;