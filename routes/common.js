const express = require("express");
const { encryptImage, decryptImage, fetchAccount, linkTelegram, getUnverifiedAccounts, enableAccount } = require("../controllers/Common");

const router = express.Router();

// middlewares
const { auth } = require("../middlewares/auth")

router.post("/encrypt", auth ,encryptImage);
router.post("/decrypt", auth ,decryptImage);

router.post("/fetch/account", auth , fetchAccount);
router.post("/update/account", auth ,);

router.post("/telegram/enableAccount", enableAccount);
router.get("/telegram/link", linkTelegram);
router.get("/telegram/admin/getUnverifiedAccounts", getUnverifiedAccounts);


module.exports = router;