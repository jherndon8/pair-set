const express = require("express")
var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
let port = process.env.PORT || 3000

const scores = []
app.get("/", (req, res) => {
    res.send("hello world")
});

app.post("/addScore", (req, res) => {
    console.log(req.body)
    scores.push(req.body.score)
    res.json({result :scores})
});


app.listen(port, () => {
    console.log("app listening on port http://localhost:" + port)
});
