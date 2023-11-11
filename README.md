# SOP_RedeemCode
This service provide 3 function

Generate Code
Path: {hostname}:{port}/code/generate
Use Request body (RAW JSON)
EX: {
  channelId: "", //accountid which can use generatecode (up to you)
  count: 0, //amount of code you want to generate
}

Get All Generated Code
Path: {hostname}:{port}/code/getgeneratecode

Redeeming Code
Path: {hostname}:{port}/code/redeeming/{code}
