var ipp = require('ipp')
var fs = require('fs')
var mysql = require('mysql')
var waterfall = require('async-waterfall')
var mime= require('mime-types')

module.exports = {
	//Lists all available printers for installation, returns array of printer info
	getPrinters: function (getPrintersCallback){
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
				}else{
					printerList=response['printer-attributes-tag']
					getPrintersCallback(printerList)
				}
			})
	},	
	//Lists all installed printers, returns array of printers with given attributes
	getInstalledPrinters: function(getInstalledPrintersCallback){
		ipp.operations['CUPS-Get-Printers']=0x4002
		var attributes=["printer-is-accepting-jobs","printer-state","printer-state-message","printer-state-reasons",
						"queued-job-count","printer-name","printer-location","printer-info","device-uri","printer-make-and-model"]
		var uri = "http://localhost:631"
		var data = ipp.serialize({
			"operation": "CUPS-Get-Printers",
			"operation-attributes-tag":{
				"attributes-charset": "utf-8",
				"attributes-natural-language": "en-us",
				"requested-attributes": attributes
			}
		})
		ipp.request(uri,data,function(err,response){
			getInstalledPrintersCallback(response['printer-attributes-tag'])
		})

	}
} 
