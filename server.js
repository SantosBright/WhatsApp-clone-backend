// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Pusher = require("pusher");

const Message = require("./dbMessage");

// app config
const app = express();
const port = process.env.PORT || 9000;
const DB_URL = "mongodb://localhost/whatsApp";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_API_KEY,
    secret: process.env.PUSHER_API_SECRET,
    cluster: "eu",
    useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
    message: "hello world",
});

// middlewares
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

// DB config
mongoose.connect(DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", async () => {
    console.log("database connected");
    const messsageCollection = db.collection("messages");
    const changeStream = messsageCollection.watch();

    changeStream.on("change", (event) => {
        console.log("change");
        if (event.operationType === "insert") {
            const message = event.fullDocument;
            pusher
                .trigger("message", "inserted", message)
                .then((data) => console.log("event went", data))
                .catch((err) => console.log(err));
        }
    });
})
    .then()
    .catch((err) => console.log(err));

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/api/v1/messages/sync", async (req, res) => {
    try {
        let messages = await Message.find();
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/api/v1/messages/new", async (req, res) => {
    try {
        let createdMessage = await Message.create(req.body);
        res.status(201).send(createdMessage);
    } catch (error) {
        res.status(500).send(error);
    }
});

// app listening
app.listen(port, () => console.log(`Server has started ${port}`));
