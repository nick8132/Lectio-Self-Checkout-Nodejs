const {exec} = require('child_process');
var emptyspace='';
console.clear()
centerVertically(3)
console.log("\x1b[31m", centerHorizontally('############--------WARNING---------###########'))
console.log("\x1b[31m", centerHorizontally('Hvis du lukker denne terminal slutter programet'))
console.log("\x1b[31m", centerHorizontally('############--------WARNING---------###########'))

function centerHorizontally(str) {
	var spaces = '';
	for (var i = 0; i < (process.stdout.columns-str.length)/2; i++) {
		spaces=spaces+' ';
	}
	console.log(spaces)
	return spaces+str+spaces
}
function centerVertically(int) {
	for (var i = 0; i < ((process.stdout.rows-int-9)/2).toFixed(0); i++) {
		console.log()
	}
}
exec('npm i', (err, idk)=>{
	if(err){
		console.log(err)
	}else{
		exec('node Main.js')
	}
})