const express = require("express")
const bodyParser = require('body-parser');
const redis = require('redis');
const app = express();
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
let port = process.env.PORT || 3000

const scores = []
app.get("/", (req, res) => {
    res.send("hello world")
});

setTimeout(async ()=>
{
    await client.connect();
});

app.get("/foo", async (req, res) => {
    console.log('jth 1')
    const val = await client.get('foo');
    console.log('jth 2', val);
    res.send(val)
});

app.post("/addScore", async (req, res) => {
    console.log(req.body)
    scores.push(req.body.score)
    if (req.bar) {
        await client.set('foo', req.bar)
    }
    res.json({result :scores, foo: client.get('foo')})
});


app.listen(port, () => {
    console.log("app listening on port http://localhost:" + port)
});
