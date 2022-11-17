const express = require("express");
const { encryptImage, decryptImage, fetchAccount } = require("../controllers/Common");

const router = express.Router();

// middlewares
const { auth } = require("../middlewares/auth")

router.post("/encrypt", auth ,encryptImage);
router.post("/decrypt", auth ,decryptImage);

router.post("/fetch/account", auth , fetchAccount);
router.post("/update/account", auth ,);


module.exports = router;