const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: "./configure.env" });
const app = require('./app');

process.on("uncaughtException", (err) => {
    console.log("uncaught exception.. shutting down");
    console.log("error", err);
    process.exit(1);
})


mongoose.connect(process.env.DATABASE_CONNECTION, {
}).then(() => {
    console.log("db connected");
}).catch((err) => {
    console.log("bd not connected" + err);
})


const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`server has been started\nlistening port ${process.env.port}...`);
})

process.on("unhandledRejection", (err) => {
    console.log("unhandled rejection.. shutting down");
    console.log("error", err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})
