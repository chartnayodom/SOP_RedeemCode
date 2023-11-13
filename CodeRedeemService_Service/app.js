const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const multer = require('multer')
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const upload = multer();
const { db_uri, db_name, db_collection } = require('./config');


app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(upload.array()); 
app.use(express.static('public'));
app.use(bodyParser.json()); 


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

//สำหรับตรวจสอบและลงเวลาหมดอายุ
const d = new Date();
d.setDate(d.getDate() + 365);


//RestController
//ยังรองรับส่ง Request แบบ Raw Json กับ Route parameter เท่านั้นนะจั๊ฟ

//generate code
app.post('/code/generate', async(req,res) =>{
    const user = req.body.channelId; //id ของศิลปิน
    const count = req.body.count; // จำนวนโค้ดที่ต้องการ Generate
    const client = new MongoClient(db_uri);
    let result = null

    const gencodes = [];
    for(let i = 0; i < count; i++){
        ded = d.toString();
        gencodes.push({
            code: generateCode(),
            expired_date: ded,
            artist: user, //user ที่ทำการขอGen
        })
    }
    await client.connect();

    try {
        result = await client.db(db_name).collection(db_collection).insertMany(gencodes)
        // console.log(result)
     } catch (e) {
        print (e);
        res.status(500).send(e);
     }

    res.status(200).send({
        "status": "ok",
        "message": "created",
        "result": result
    })
})


//get generated code
app.get('/code/getgeneratecode/', async(req,res) => {
    const artist = req.body.channelId
    const client = new MongoClient(db_uri);
    await client.connect()
    const codes = await client.db(db_name).collection(db_collection).find({"artist": artist}).toArray(); // ใน ({ เติม field ที่จะใช้หา })
    await client.close();
    res.status(200).send(codes);
})


//redeeming
app.post('/code/redeeming/', async(req,res) => {
    const inputcode = req.body.code; //if use body
    const userId = req.body.userId; //สำหรับไปทำส่วนของ Service subscription
    const client = new MongoClient(db_uri);
    await client.connect()
    let code = null
    code = await client.db(db_name).collection(db_collection).findOneAndDelete({"code" : inputcode });
    await client.close();
    if(code != null){
        //check วันหมดอายุ
        if(Date.parse(code.expired_date) < Date.now() && code.expired_date !== null){
            res.status(404).send({
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
    else{
        console.log("not found");
        res.status(404).send({
            result: false, message: "ไม่พบโค้ดนี้ หรือ โค้ดถูกใช้งานไปแล้ว"
        });
    }
})

app.listen(8888, () => {
    console.log("Code Service Run in port:" + 8888);
})
