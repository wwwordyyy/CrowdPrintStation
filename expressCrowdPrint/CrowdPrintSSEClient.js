var http=require('http');
var request=require('request');
var fs=require('fs');
var mysql=require('mysql');

//var SERVER_ADDRESS="http://192.168.1.9:8080";
//var SERVER_ADDRESS="http://49.149.239.130:8080";
var SERVER_ADDRESS="http://localhost";
var HOST="localhost";
var USERNAME="root";
var PASSWORD="damned21";
var DATABASE_NAME="crowdprintstation";
var TABLE_NAME="stationjobs";
var CROWDPRINT_PATH="expressCrowdPrint/";

var EventSource = require('eventsource');
var es = new EventSource(SERVER_ADDRESS+'/CrowdPrintServer/crowdprintsse.php');
var jobKeys="";



es.addEventListener('jobnames', function (e) {
	jobKeys=e.data;
	if(jobKeys=="no jobs"){
		console.log("No jobs right now");
	}else if (jobKeys!="no jobs"){
		console.log("Queued Jobs:");
		console.log(jobKeys);
		jobKeys=jobKeys.split("\n");
		console.log("Job to download: " + jobKeys[0]);
		downloadJob(jobKeys[0]);
		
		//clearJob(jobName[0]);
		
	}
});



function downloadJob(jobKey){
	//download job given jobkey
	var jobInfo;
	request.post(SERVER_ADDRESS+"/CrowdPrintServer/getjob.php",{	//get the file name from the server
			form:{
				jobId: jobKey,
				statusUpdate:"Downloaded" //update status of job to downloaded
			}	
		},
		function(err,res,body){
			if(err){ throw err;}
			if(body){
				jobInfo=JSON.parse(body);	//parse response as JSON {JobName and JobId}
				console.log(jobInfo.JobName);	
				var jobFile=fs.createWriteStream("./printjobs/"+jobInfo.JobName);	//download the file
				var theRequest=http.get(SERVER_ADDRESS+"/CrowdPrintServer/pdf/"+jobInfo.JobName,function(response){
					response.pipe(jobFile);	
					console.log("Downloading");	//update status to downloading
					request.post(SERVER_ADDRESS+"/CrowdPrintServer/getjob.php",{form:{jobId:jobKey, statusUpdate:"Downloaded"}},
						function(err,res,body){
							console.log("Downloaded");	//update to downloaded when complete
							storeJob(jobInfo);
						}
					);
				});
				
						
			}
		}
	);
	
	
}

function storeJob(jobInfo){
	var con=mysql.createConnection({
		host: HOST,
		user: USERNAME,
		password: PASSWORD,
		database: DATABASE_NAME
	});

	con.connect(function(err){
		if(err) throw err;
		input="'"+jobInfo.JobId+"','"+"DEFAULT"+"','"+jobInfo.JobName+"','"+"Not Printed"+"'";
		query="INSERT INTO "+TABLE_NAME+" (JobId,UserName,FileName,Status) VALUES ("+input+")";
		con.query(query,function(err){
			if(err)throw err;
		});

	});

}

function clearJob(jobName){
	request.post(SERVER_ADDRESS+"/CrowdPrintServer/PrintJobDownloaded.php",{
		form:{
				jobname:jobName
			}	
		},
		function(err,res,body){
			if(err) throw err;
	});
	console.log(jobName);
	console.log("Cleared job");
}
