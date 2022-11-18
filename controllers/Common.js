const { response } = require("express");
const FormData = require("form-data");
const fs = require("fs");
const fetch = require("cross-fetch");
const User = require("../models/User");

exports.encryptImage = async (req, res) => {

  if (!req.user.telegramId) return res.status(400).json({error: "Please connect your telegram"})

    let reqData = req.body;
//   let reqTok = reqData.token;
let reqID = 'IMG'+new Date().getTime();
  let encryptImage;
  let encryptUploadPath;

  // console.log(req.body,req.files)
    try{
        if (req.files){
          if (req.files.encrypt){
            encryptImage = req.files.encrypt;
            encryptUploadPath = __dirname + "/../uploads/" + reqID + ".jpg";
            // console.log(encryptUploadPath, req.files)
            //send image to api

            encryptImage.mv(encryptUploadPath, async function(err) {
              if (err)
              {
                console.log(err)
                return res.status(500).send(err);
              }

            //   read file to formdata
            let formData = new FormData();
            formData.append('image', fs.createReadStream(encryptUploadPath));
            formData.append('id', reqID);


             await fetch(`${process.env.FILE_SERVER}/upload`, {
                method: 'POST',
                body: formData,
            }).then(response => response.json().then((r)=>{
                if (r.success){
                    // delete file
                    fs.unlink(encryptUploadPath, (err) => {
                        if (err) {
                          console.error(err)
                          return
                        }
                        //file removed
                      })
                }
            })).catch(error => console.error('Error:', error))

            // const key = "gautham"

            // make an api call 
            formData = new FormData();
            formData.append('file', reqID);
            // formData.append('key', key);
            let resp = await fetch(`${process.env.FILE_SERVER}/encrypt`, {
                method: 'POST',
                body: formData,
                // body: { file: reqID, key: key  },
            },).catch(error => console.error('Error:', error))
            resp = await resp.json()
            
            let msg = `Your key is ${resp.key} for Image ID ${reqID}`;
            fetch(`https://api.telegram.org/bot${process.env.botToken}/sendMessage?chat_id=${req.user.telegramId}&text=${msg}`,{
                method: 'get',
            }).catch(error => console.error('Error:', error))

            if (resp.success){
                res.status(200).send({success: true, file: `${process.env.FILE_SERVER}/download?file=${reqID}.jpg`})
            }else{
                res.status(400).send({success: false, message: "Encryption failed"})
            }
          })
        }
    }
    }catch(error){
        console.log(error)
        return res.status(400).send({success:false ,error: "Error in uploading image"});
      }
    //   res.json({success:true ,message: "Image uploaded successfully"});
  };
  
  exports.decryptImage = async (req, res) => {
    if (!req.user.telegramId) return res.status(400).json({error: "Please connect your telegram"})
    let reqData = req.body;
    let key = reqData.key;

    if (!key) return res.status(400).json({error: "No key was uploaded"})
//   let reqTok = reqData.token;
let reqID = 'D_IMG'+new Date().getTime();
  let decryptImage;
  let decryptUploadPath;
  console.log(req.body,req.files)
//   console.log(req.body)l
    try{
      console.log(1)
      if (req.files){
        console.log(2)
        if (req.files.decrypt){
          console.log(3)
          decryptImage = req.files.decrypt;
          decryptUploadPath = __dirname + "/../uploads/" + reqID + ".jpg";
          console.log(decryptUploadPath, req.files)
          //send image to api
          
          decryptImage.mv(decryptUploadPath, async function(err) {
            if (err)
            {
              console.log(err)
              return res.status(500).send(err);
            }
            console.log(4)
            
            //   read file to formdata
            let formData = new FormData();
            formData.append('image', fs.createReadStream(decryptUploadPath));
            formData.append('id', reqID);
            


             await fetch(`${process.env.FILE_SERVER}/upload`, {
                method: 'POST',
                body: formData,
            }).then(response => response.json().then((r)=>{
                if (r.success){
                    // delete file
                    fs.unlink(decryptUploadPath, (err) => {
                        if (err) {
                          console.error(err)
                          return
                        }
                        //file removed
                      })
                }
            })).catch(error => console.error('Error:', error))

            

            // make an api call 
            formData = new FormData();
            formData.append('file', reqID);
            formData.append('key', key);
            // formData.append('key', key);
            console.log(formData)
            let resp = await fetch(`${process.env.FILE_SERVER}/decrypt`, {
                method: 'POST',
                body: formData,
                // body: { file: reqID, key: key  },
            },).catch(error => console.error('Error:', error))
            resp = await resp.json().catch(error => console.error('Error', error))
            if (resp.success){
                res.status(200).send({success: true, file: `${process.env.FILE_SERVER}/download?file=${reqID}.jpg`})
            }else{
                res.status(400).send({success: false, message: "Decryption failed"})
            }
          })
        }
    }
    }catch(error){
        console.log(error)
        return res.status(400).send({success:false ,error: "Error in uploading image"});
      }
   
  }

  exports.fetchAccount = async (req, res) => {
    let {name, username, telegramId} = req.user;
    let code
    if (!telegramId) {
      const { generateApiKey } = require("generate-api-key");
      code = generateApiKey({
        method: "string",
        pool: "0123456789",
        length: 4,
      });
      req.user.teleRegCode = code;
       await req.user.save()

    }
    res.json({success:true , name: name, username: username, telegramId: telegramId || "", teleRegCode: code});
  }

  exports.linkTelegram = async (req, res) => {
    let {code, chat_id, username } = req.query;
    console.log(code, chat_id, username)
    User.findOne({ teleRegCode: code, username: username }).exec(async (err, user) => {
      if (err) {
        // console.log(err);
        return res.send({ success: false, message: err });
      }
      if (!user) {
        // console.log(req.query?.token);    
        return res.send({ success: false, message: "Invalid code" });
      }
      user.telegramId = chat_id;
      await user.save()
      res.json({success:true , message: "Telegram linked successfully"});
    });
  };

  exports.getUnverifiedAccounts = async (req, res) => {
    // let { } = req.query;
    // console.log()
    User.aggregate([{"$match": { "enabled": false }},{"$project": {"name": 1, "username": 1, }}]).exec(async (err, user) => {
      if (err) {
        // console.log(err);
        return res.send({ success: false, message: err });
      }
      
      res.json({success:true , users: user});
    });
  };

  exports.enableAccount = async (req, res) => {
    let { usernames } = req.body;
    // console.log(usernames)
    // set enabled to true for all usernames
    User.updateMany({ username: { $in: usernames } }, { $set: { enabled: true } }, (err, user) => {
      if (err) {
        console.log(err);
        return res.send({ success: false, message: "Internal server error" });
      }
      // console.log(user)
      if (user.matchedCount == 0) {
        return res.send({ success: false, message: "No user found" });
      }

      return res.json({success:true , message: "Accounts enabled successfully"});
    });
    // res.json({success:true , message: "Account(s) enabled successfully"});
  };