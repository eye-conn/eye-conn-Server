const mongoose = require("mongoose")


function connectToDB(){
    mongoose
	.connect(process.env.DATABASE, { useNewUrlParser: true })
	.then(() => {
		console.log("Connected to Database!");
	})

}

module.exports = { connectToDB };