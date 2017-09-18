var ipp = require('ipp');

var printers;

var printerInfoCallback=function callback(printerList){
	var searchName=process.argv[2];
	var index=0;
	var printerName="";
	var printerInfo;
	console.log(printerList)
	while(printerName!==searchName){
		//printerName=printerList[index]['printer-name'];
		printerInfo=printerList[index];
		index++;
	}
	if(printerName===searchName){
		console.log(printerInfo);
	}else{
		console.log("Printer Not Found");
	}
	


}

function getPrinters(callback){
	ipp.operations['CUPS-Get-Printers']=0x4002;
	var attributes=['printer-name','printer-state','printer-state-message','printer-state-reasons'];
	var uri = "http://localhost:631";
	var data = ipp.serialize({
		"operation": "CUPS-Get-Printers",
		"operation-attributes-tag": {
		"attributes-charset": 'utf-8',
		"attributes-natural-language": 'en-us',
		"requested-attributes":attributes
		}
	});
	ipp.request(uri, data, function(err, response){
		if(err){
			console.log(err);
			callback(err); 
		}
		printerList=response//['printer-attributes-tag'];
		callback(printerList);
	});
}
function getJobs(){

	ipp.operations['Get-Job-Attributes']=0x0009;
	var attributes=['printer-name','printer-state','printer-state-message','printer-state-reasons'];
	var uri = "http://127.0.0.1:631";
	var data = ipp.serialize({
		"operation": "Get-Job-Attributes",
		"operation-attributes-tag": {
		"attributes-charset": 'utf-8',
		"attributes-natural-language": 'en-us',
		"printer-uri": 'ipp://localhost:631/',
		"job-id":'204',
		"requesting-user-name":'gab'
		}
	});
	ipp.request(uri, data, function(err, response){
		if(err){
			console.log(err);
		}
		console.log(response);
		
	});
}
function getDevices(){
	ipp.operations['CUPS-Get-Devices']=0x400B
	var uri = "http://localhost:631"
	var data = ipp.serialize({
		"operation": "CUPS-Get-Devices",
		"operation-attributes-tag": {
		"attributes-charset": 'utf-8',
		"attributes-natural-language": 'en-us'
		}
	});
	ipp.request(uri, data, function(err, response){
		if(err){
			console.log(err)
		}
		console.log(response)
	});
}
function getPPD(ppdName){
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
	})
}
function getPPDs(){
	ipp.operations['CUPS-Get-PPDs']=0x400C
	var uri="http://localhost:631"
	var data = ipp.serialize({
		"operation":"CUPS-Get-PPDs",
		"operation-attributes-tag":{
			"attributes-charset": "utf-8",
			"attributes-natural-language": "en-us",
			"ppd-make-and-model":"HP Photosmart Ink Adv K510"
		}
	})
	ipp.request(uri,data,function(err,response){
		if(err){
			console.log(err)
		}
		var ppdList=response['printer-attributes-tag']
		ppdName=ppdList['ppd-name']
		console.log(ppdName)
		getPPD(ppdName)
	})
}

if(process.argv.length!=3){
	console.log("Please Include printername");
	process.exit(1);
}
getPrinters(printerInfoCallback)
//getJobs();
//getDevices();
//getPPDs()
