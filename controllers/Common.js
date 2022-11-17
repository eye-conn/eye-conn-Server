const { response } = require("express");
const FormData = require("form-data");
const fs = require("fs");
const fetch = require("cross-fetch");
exports.encryptImage = async (req, res) => {

    let reqData = req.body;
//   let reqTok = reqData.token;
let reqID = 'IMG'+new Date().getTime();
  let encryptImage;
  let encryptUploadPath;

//   console.log(req.body)l
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
    
    
   
  }

  exports.fetchAccount = async (req, res) => {
    let {name, username, telegramId} = req.user;
    res.json({success:true , name: name, username: username, telegramId: telegramId || ""});
  }