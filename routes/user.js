const express = require("express");

const router = express.Router();
 
// middlewares
const { auth } = require("../middlewares/auth")

// controller
const { updateUser, currentUser, RegisterUser, LoginUser, verifyToken } = require("../controllers/User");

router.post("/update-user", auth ,updateUser);
router.post("/login", LoginUser);
router.post("/signup", RegisterUser);

router.post("/verifyToken", verifyToken)
router.get("/logout", ( req, res )=>{
    if(req.user){
        req.logout();
        res.json({
            success: true
        })
    }
    else{
        res.json({
            success: false
        })
    }
})

module.exports = router;