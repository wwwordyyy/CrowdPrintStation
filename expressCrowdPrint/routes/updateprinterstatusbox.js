var express = require ('express')
var router = express.Router()

var mysql = require('mysql')
var cpCommands = require("/home/gab/expressCrowdPrint/CrowdPrinterCommands/CrowdPrinterCommands")

var HOST="localhost"
var USERNAME="root"
var PASSWORD="damned21"
var DATABASE_NAME="crowdprintstation"
var TABLE_NAME="stationjobs"

router.get("/",function(req,res){
	cpCommands.getInstalledPrinters(function(result){
		res.json(result)
	})


})

module.exports = router