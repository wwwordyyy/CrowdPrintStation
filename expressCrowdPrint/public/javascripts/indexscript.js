$(document).ready(function(){
			$("#findprinters").click(function(){
				//ajax call to findprinters.js update dropdown on success
				$.ajax({
					url:"findprinters",
					type:"GET",
					success:function updateDropdown(msg){
						$("#listofprinternames").empty()
						for (var num in msg){
							printer=msg[num]
							if(printer['device-make-and-model']!=='Unknown'){
								$("#listofprinternames").append("<option value='"+JSON.stringify(printer)+"'>"+printer['device-info']+"</option>")
							}
						}
					}
				})			
			})
			$("#startprinting").click(function(){
				$.ajax({
					url:"startprinting",
					type:"POST",
					data: {
						jobKey: document.getElementById("jobKey").value
					},
					datatype: "json",
					success:function printingResponse(msg){
						alert(msg)
					}
				})
			})
			setInterval(function updatePrinterStatusBox(){
				var elements=document.getElementsByClassName("printerStatusBox")
				for(var index=0; index<elements.length; index++){
					$.ajax({
						url:"updateprinterstatusbox",
						type:"GET",
						success:function printingResponse(msg){
							turnListIntoTable(msg,function(theTable){
								//alert(JSON.stringify(msg))
								//alert(theTable)
								var printerStatusBoxList = document.getElementsByClassName("printerStatusBox")
								for(var index=0; index<printerStatusBoxList.length; index++){
									printerStatusBoxList[index].innerHTML=theTable
								}
							})
						}
					})
				}
			},3000)			
})		
function turnListIntoTable(list,turnListIntoTableCallback){

	var columnHeaders=["Printer Name","Printer Model","Number of Jobs","Status", "Description", "Location"]
	var theTable="<table>"
	theTable+="<thead>"
	theTable+="<tr>"
		for(var index=0;index<columnHeaders.length;index++){
			theTable+="<th>"+columnHeaders[index]+"</th>"
		}
	theTable+="</tr>"
	theTable+="</th>"

	//create table body
	theTable+="<tbody>"
	for(var index=0;index<list.length;index++){
		theTable+="<tr>"
		theTable+="<td>"+list[index]['printer-name']+"</td>"
		theTable+="<td>"+list[index]['printer-make-and-model']+"</td>"
		theTable+="<td>"+list[index]['queued-job-count']+"</td>"

		if(list[index]['printer-is-accepting-jobs']===true){
			theTable+="<td>"+list[index]['printer-state']
		}else{
			theTable+="<td>"+"Not Accepting Jobs"			
		}
		if(list[index]['printer-state-reasons']!=="none" || list[index]['printer-state-message']!==""){
				theTable+="<br>"+"Printer Message: "+list[index]['printer-state-message']
				if(list[index]['printer-state-reasons']!=="none"){
					theTable+="<br>"+"Printer list: "+Reason[index]['printer-state-reasons']
				}
		}	
		theTable+="</td>"		
		

		theTable+="<td>"+list[index]['printer-info']+"</td>"
		theTable+="<td>"+list[index]['printer-location']+"</td>"
		theTable+="</tr>"
	}
	theTable+="</tbody>"

	theTable+="</table>"

	turnListIntoTableCallback(theTable)
}
