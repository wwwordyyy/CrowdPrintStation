var express = require ('express')
var router = express.Router()
var multer =  require('multer')
var upload = multer()

var ipp = require('ipp')
var waterfall=require('async-waterfall')
var fs = require('fs')


function getPPDs(printerMakeandModel,printerUri,printerName){
	ipp.operations['CUPS-Get-PPDs']=0x400C
	var uri="http://localhost:631"
	var data = ipp.serialize({
		"operation":"CUPS-Get-PPDs",
		"operation-attributes-tag":{
			"attributes-charset": "utf-8",
			"attributes-natural-language": "en-us",
			"ppd-make-and-model": printerMakeandModel
		}
	})
	return function(getPPDsCallback){
		ipp.request(uri,data,function(err,response){
			if(err){
				console.log(err)
			}
			if(response['statusCode']==="successful-ok"){
				var ppdList=response['printer-attributes-tag']
				ppdName=ppdList['ppd-name']
				getPPDsCallback(null,printerUri,ppdName)
			}else{
				getPPDsCallback(null,printerUri,"No PPD Found")
			}
		})
	}	
}

function getPPD(printerUri,ppdName,getPPDCallback){
	ipp.operations['CUPS-Get-PPD']=0x400F
	var uri="http://localhost:631"
	var data = ipp.serialize({
		"operation":"CUPS-Get-PPD",
		"operation-attributes-tag":{
			"attributes-charset": "utf-8",
			"attributes-natural-language": "en-us",
			"ppd-name":ppdName
		}
	})
	ipp.request(uri,data,function(err,response){
		if(err){
			console.log(err)
		}
		console.log(response)
		if(response['statusCode']==="successful-ok"){
			var ppdFileName='./ppd/'+ppdName.substr(ppdName.lastIndexOf("/")+1)
			fs.writeFile(ppdFileName,response.data,'utf-8')
			getPPDCallback(err,ppdFileName)
		}else{
			getPPDCallback(err,"No PPD Found")
		}
		
	})
}
function addPrinter(printerUri,ppdFileName,printerName,printerDesc,printerLoc,res){

	fs.readFile(ppdFileName,function(err,filedata){
		
		ipp.operations['CUPS-Add-Modify-Printer']=0x4003
		var uri="http://localhost:631"
		var data = ipp.serialize({
			"operation":"CUPS-Add-Modify-Printer",
			"operation-attributes-tag":{
				"attributes-charset": "utf-8",
				"attributes-natural-language": "en-us",
				"printer-uri": "ipp://localhost:631/printers/"+printerName
			},
			"printer-attributes-tag":{
				"device-uri":printerUri,
				"printer-is-accepting-jobs":true,
				"printer-state":"idle",
				"printer-info": printerDesc,
				"printer-location": printerLoc
			},
			"data": filedata
		})
		
		ipp.request(uri,data,function(err,response){
			if(err){
				console.log(err)
			}
			console.log(printerUri)
			console.log(response.statusCode)
			var statusCode=response.statusCode
			//addPrinterCallback(null,response)
			res.send(JSON.stringify(statusCode))
		})	
				
	})

}

function getPrinterPPD(printerInfo,res){
	waterfall([
		getPPDs(printerInfo['device-make-and-model'],printerInfo['device-uri']),
		getPPD
	], 
	function(err,result){
		res.render('installprinter',{printerInfo: printerInfo, ppdPath:result})
	})
}
router.post('/nextstep',upload.array(),function(req,res,next){
	var printerInfo=JSON.parse(req.body['printerInfo'])
	console.log(printerInfo)
	addPrinter(printerInfo["printerUri"],printerInfo["ppdFilePath"],printerInfo["printerName"],
				printerInfo["printerDesc"],printerInfo["printerLoc"],res)
})
router.post('/',upload.array(),function(req,res,next){
	var printerInfo=JSON.parse(req.body['printer'])
	getPrinterPPD(printerInfo,res)
})


module.exports = router