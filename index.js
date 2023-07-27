const express = require("express");
const app = express();
const cors = require("cors");
const redis = require("redis");
const axios = require("axios");
const client = redis.createClient();
const ExpireTime = 3600
const path = require("path");
const session = require("express-session");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const day = 24 * 60 * 60 * 1000
app.use(session({
    secret: "secretkey",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: day,
    }
}));
app.use(express.json());
app.use(express.static("./pages"));
app.use('/assets', express.static(path.join(__dirname, "/assets")));
app.use(express.text());
(async () => {
    await client.on("error", (error) => console.error(error));
    await client.connect();
    console.log("redis client connected");
})();
// checking redis usage
app.get("/data", async (req, res) => {
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
    const response = await redisGetOrSetData(`photo${req.params.id}`, async () => {
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
        return data
    })
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

app.get("/", async (req, res) => {
    if (req.session.authorized) {
        res.redirect("/homepage")
    } else {
        res.sendFile(path.join(__dirname, "./pages/login.html"))

    }
})
app.get("/register", async (req, res) => {
    if (req.session.authorized) {
        res.redirect("/homepage")
    } else {
        res.sendFile(path.join(__dirname, "./pages/register.html"))
    }
})
app.get("/homepage", async (req, res) => {
    if (req.session.authorized) {
        res.sendFile(path.join(__dirname, "./pages/homepage.html"))
    } else {
        res.redirect("/")
    }
})
app.post("/register", async (req, res) => {
    if (req.body.username && req.body.password) {
        await client.set(req.body.username, req.body.password)
        res.redirect("/")
    } else {
        res.redirect("/register")
    }
})
app.post("/", async (req, res) => {
    if (req.body.username && req.body.password) {
        const response = await client.get(req.body.username)
        if (response === req.body.password) {
            req.session.user = req.body
            req.session.authorized = true
            res.redirect("/homepage")
        } else {
            res.redirect("/")
        }
    } else {
        res.redirect("/")
    }

})
app.post("/logout", async (req, res) => {
    req.session.destroy()
    res.redirect("/")
})
app.listen(1000, () => {
    console.log("WORKING ON", 1000);
})