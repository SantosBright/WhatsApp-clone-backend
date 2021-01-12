// imports
const express = require("express");
const mongoose = require("mongoose");
const Pusher = require("pusher");

const Message = require("./dbMessage");

// app config
const app = express();
const port = process.env.PORT || 9000;
const DB_URL = "mongodb://localhost/whatsApp";

const pusher = new Pusher({
    appId: "1135512",
    key: "19e402f8ecd854e074d2",
    secret: "1979731cd2d75f530841",
    cluster: "eu",
    useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
    message: "hello world",
});

// middlewares
app.use(express.json());

// DB config
mongoose
    .connect(DB_URL, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(`Database not connected ${err}`));

mongoose.Promise = Promise;

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
