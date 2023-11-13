# SOP_RedeemCode
Before run service<br>
Add collection name "code" in NOSQL Database you want to<br><br>
Get into "CodeRedeemService_Service" Directory<br>
Run command:<br>
npm install<br>
npm install -g nodemon<br>
<br>
After install<br>
type "nodemon app.js" <br>
<br>


This service provide 3 functions<br>
Support Form-data, x-www-form-urlencoded, raw json<br>

Generate Code <br>
Path: {hostname}:{port}/code/generate <br>
Use Request body (RAW JSON)<br><br>
EX: {<br>
  channelId: "", //accountid which can use generatecode (up to you)<br>
  count: 0, //amount of code you want to generate<br>
}<br>
Return: {
        "status": "ok",
        "message": "created"
        "result": query result object
        }
    
<br>
Get All Generated Code<br>
Path: {hostname}:{port}/code/getgeneratecode<br>
Use Request body (RAW JSON)<br>
EX: { <br>
  channelId: "". //to find generated code by artistid<br>
}<br>
Return: List of Code that generated by channelId<br><br>
[<br>
    {<br>
        "_id": "654f8ff29819b6682eef3f5b",<br>
        "code": "QLWLCIR3EB7F",<br>
        "expired_date": "Sun Nov 10 2024 21:12:54 GMT+0700 (Indochina Time)",<br>
        "artist": "testy"<br>
    },<br>
    {<br>
        "_id": "654f8ff29819b6682eef3f5c",<br>
        "code": "TIBEHLOOSCOH",<br>
        "expired_date": "Sun Nov 10 2024 21:12:54 GMT+0700 (Indochina Time)",<br>
        "artist": "testy"<br>
    }<br>
]<br><br>
Redeeming Code<br>
Path: {hostname}:{port}/code/redeeming/<br>
<!-- use path parameter name "code" means code that want to redeem. <br> -->
Use Request body (RAW JSON){
  code: "code",
  userId: "userid"
}<br>
Return { result: true (or false), message: "message"} <br>
