const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
// const http = require('http');
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
        // "expired_date": d.toString
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
app.post('/code/redeeming/', async(req,res) => {
    // const inputcode = req.params.code; //if use params
    console.log(req.body)
    const inputcode = req.body.code; //if use body
    const userId = req.body.userId; //สำหรับไปทำส่วนของ Service subscription
    const client = new MongoClient(uri);
    await client.connect()
    let code = null
    code = await client.db("SOA").collection("code").findOneAndDelete({"code" : inputcode });
    await client.close();
    console.log(Date.parse(code.expired_date) < Date.now());
    if(code != null){
        console.log(code);
        if(Date.parse(code.expired_date) < Date.now() && code.expired_date !== null){
            res.status(400).send({
                result: false, message: "โค้ดนี้หมดอายุแล้ว"
            });
        }
        //ทำการได้สถานะ membership โดยการยิงไปService Membership
        const resp = await fetch("http://localhost:8082/membership-service/subscription/redeemCode",{
            method: "POST",
            body: JSON.stringify({
                userId: userId, //userid
                channelId: code.artist, //artistid
                code: code.code,
                subscribed: true
                
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        console.log(resp.statusText)
        res.status(200).send({
            result : true, message: "คุณทำการแลกรางวัลสำเร็จแล้ว"
        })
    }
    // else if(Date.parse(code.expired_date) < Date.now()){
    //     res.status(400).send(false);
    // }
    else{
        console.log("not found");
        res.status(400).send({
            result: false, message: "ไม่พบโค้ดนี้ หรือ โค้ดถูกใช้งานไปแล้ว"
        });
    }

    // var options = {
    //     host: '',
    //     port: 80,
    //     path: '/',
    //     method: 'POST',
    //     body: JSON.stringify({
            
    //     }),
    //     headers: {
    //         "Content-type": "application/json; charset=UTF-8"
    //     }
    // }

    // var httpreq = http.request(options, function(response){
    //     response.setEncoding('utf-8');
    //     response.on('data')
    // })

    
})

app.get("/code/test", async(req,res) => {
    const client = new MongoClient(uri);
    let code = null
    code = await client.db("SOA").collection("code").findOne({"_id": new ObjectId('655079b3e3147af7fafe4d5f')});
    client.close()
    console.log(code)
    res.status(200).send({text: "nice!"})
})


//เดี๋ยวหาวิธีauto port มา
// const port = Math.random()
app.listen(8888, () => {
    console.log("Code Service Run in port:" + 8888);
    // console.log('server start');
})