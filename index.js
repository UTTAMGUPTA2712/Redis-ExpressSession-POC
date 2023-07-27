const express = require("express");
const app = express();
const cors = require("cors");
const redis = require("redis");
const axios = require("axios");
const client = redis.createClient();
const ExpireTime = 3600
const session = require("express-session");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const day=24*60*60*1000
app.use(session({
    secret: "secretkey",
    resave: true,
    saveUninitialized: true,
    cookie:{
        maxAge: day,
    }
}));
app.use(express.json());
app.use(express.text());
(async () => {
    await client.on("error", (error) => console.error(error));
    await client.connect();
    console.log("redis client connected");

})();

app.get("/", (req, res) => {
    res.send("WORKING");
})

// checking redis usage
app.get("/data", async (req, res) => {
    // console.log("there");
    // const data = await client.get("photo")
    // if (data) {
    //     console.log("cache");
    //     res.json(JSON.parse(data))
    // } else {
    //     console.log("api");
    //     const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
    //     client.setEx("photo", ExpireTime, JSON.stringify(data));
    //     res.json(data)
    // }
    const response = await redisGetOrSetData("photo", async () => {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
        return data
    })
    if (req.session.authorized) {
        res.json(response)
    } else {
        res.send("go to login page first")
    }
})
app.get("/data/:id", async (req, res) => {
    // const id = req.params.id;
    // console.log(id);
    const response = await redisGetOrSetData(`photo${req.params.id}`, async () => {
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
        return data
    })
    // const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
    // res.json(data)
    if (req.session.authorized) {
        res.json(response)
    } else {
        res.send("go to login page first")
    }
})

const redisGetOrSetData = async (key, callBack) => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await client.get(key)
            if (data !== null) {
                resolve(JSON.parse(data))
            } else {
                const data = await callBack()
                client.setEx(key, ExpireTime, JSON.stringify(data))
                resolve(data)
            }
        }
        catch (err) {
            reject(err)
        }
    })
}

// login api to check session

app.get("/login", async (req, res) => {
    req.session.authorized = true
    res.send("Logged in")
})
app.get("/logout", async (req, res) => {
    req.session.destroy()
    res.send("Logged out")
})

app.listen(1000, () => {
    console.log("WORKING ON", 1000);
})