var express= require('express')
var router=express.Router()
var multer= require('multer')
var upload= multer()

var ipp = require('ipp')
var fs = require('fs')
var mysql = require('mysql')
var waterfall = require('async-waterfall')
var mime= require('mime-types')

var HOST="localhost"
var USERNAME="root"
var PASSWORD="damned21"
var DATABASE_NAME="crowdprintstation"
var TABLE_NAME="stationjobs"

function getFileName(jobKey,printerName,userName){
	var con = mysql.createConnection({
		host: HOST,
		user: USERNAME,
		password: PASSWORD,
		database: DATABASE_NAME
	})

	return function(getFileNameCallback){
		con.connect(function(err){
			if (err) throw err
			var sqlQuery="SELECT * FROM "+TABLE_NAME+" WHERE JobId=\""+jobKey+"\""
			con.query(sqlQuery,function(err,result){
				if (err) throw err
				getFileNameCallback(null,printerName,result[0].FileName,userName)
			})

		})
	}
}

function getFile(printerName,fileName,userName,getFileCallback){
	var rootFilePath="./printjobs/"
		fs.readFile(rootFilePath+fileName,function(err,file){
			getFileCallback(null,printerName,fileName,userName,file)
		})
	
}	
function printFileIPP(printerName,fileName,userName,file,printFileIPPCallback){
	var mimeType=mime.lookup(fileName)
	var printer= ipp.Printer("http://localhost:631/printers/"+printerName)
	var msg ={
			"operation-attributes-tag":{
				"requesting-user-name":userName,
				"job-name":fileName,
				"document-format":mimeType
			},
			data: file
		}
	printer.execute("Print-Job",msg,printFileIPPCallback)
}

function printingProcess(jobKey,printerName,userName,res){
	waterfall([
		getFileName(jobKey,printerName,userName),
		getFile,
		printFileIPP
	],function printingProcessDone(err,msg){
		var jobInfo=msg["job-attributes-tag"]
		console.log(msg)
		if(msg['statusCode']==="successful-ok"){
			res.send("Added to print queue:\nJob Id is "+jobInfo['job-id']+".")			
		}
		else if (msg['statusCode']==="client-error-not-found"){
			res.send("Error in printing:\n"+msg['operation-attributes-tag']['status-message'])
		}
		else if(msg['statusCode']==="server-error-not-accepting-jobs"){
			res.send("Printer is not accepting jobs")
		}
	})
}


router.post('/',upload.array(),function (req,res,next){	
		var response=req.body
		printingProcess(response.jobKey,"hpprinter","gab",res)

})


module.exports=router