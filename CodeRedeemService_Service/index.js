const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json());

app.get('/code/getredeemcode', (req,res) =>{
    // console.log("trigger")
    res.send("<p>Hi there</p>");
})

app.listen(8080, () => {
    console.log('server start');
})