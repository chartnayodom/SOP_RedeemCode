const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const uri = "mongodb://127.0.0.1:27017"; //แนะนำเป็น ipv4 ดีกว่า

app.use(cors())
app.use(express.json());

//other function
//codegenerator
function generateCode(){
    const characters =  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const codeLength = 12;
    let redeemcode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        redeemcode += characters.charAt(randomIndex);
    }
    return redeemcode
}

const d = new Date();
d.setDate(d.getDate() + 365);


//RestController
//ยังรองรับส่ง Request แบบ Raw Json กับ Route parameter เท่านั้นนะจั๊ฟ
//generate code
app.post('/code/generate', async(req,res) =>{
    const user = req.body.channelId; //id ของศิลปิน
    const count = req.body.count; // จำนวนโค้ดที่ต้องการ Generate
    const client = new MongoClient(uri);

    const gencodes = [];
    for(let i = 0; i < count; i++){
        ded = d.toString();
        gencodes.push({
            code: generateCode(),
            expired_date: ded,
            artist: user, //user ที่ทำการขอGen
        })
    }
    console.log(gencodes)
    await client.connect();

    // await client.db('SOA').collection("code").insertOne({
    //     code: generateCode(),
    //     expired_date: d.toString,
    //     artist: user, //user ที่ทำการขอGen
        
    // })

    try {
        client.db('SOA').collection("code").insertMany(gencodes)
     } catch (e) {
        print (e);
     }

    res.status(200).send({
        "status": "ok",
        "message": "created",
        "expired_date": d.toString
    })
})


//get generated code
app.get('/code/getgeneratecode/', async(req,res) => {
    const artist = req.body.channelId
    const client = new MongoClient(uri);
    await client.connect()
    const codes = await client.db("SOA").collection("code").find({"artist": artist}).toArray(); // ใน ({ เติม field ที่จะใช้หา })
    await client.close();
    res.status(200).send(codes);
})

//hostname:8080/code/redeeming/{โค้ด}
//redeeming
app.post('/code/redeeming/:code', async(req,res) => {
    const inputcode = req.params.code; //if use params
    // const inputcode = req.body.code; //if use body
    const userId = req.body.userId; //สำหรับไปทำส่วนของ Service subscription ?
    const client = new MongoClient(uri);
    await client.connect()
    const code = await client.db("SOA").collection("code").findOneAndDelete({"code" : inputcode });
    if(code){
        console.log(code);
        await client.close();
        //ทำการได้สถานะ membership
        res.status(200).send(true)
    }
    else{
        console.log("not found");
        await client.close();
        res.status(400).send(false);
    }
})


//เดี๋ยวหาวิธีauto port มา
const port = 8080;
app.listen(8080, () => {
    console.log("Code Service Run in port:" + port);
    // console.log('server start');
})