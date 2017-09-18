var express = require('express')
var router = express.Router()
var ipp = require('ipp')

var waterfall = require('async-waterfall')
var cpCommands = require("/home/gab/expressCrowdPrint/CrowdPrinterCommands/CrowdPrinterCommands")

function getPrintersProcess(res){
	cpCommands.getPrinters(function(result){
		res.json(result)
	})
}


/* GET users listing. */
router.get('/', function(req, res, next) {
	getPrintersProcess(res)
})

module.exports = router
