


function Cli(){
	this.stream = process.stderr;
	
	this.write = function(str){
		this.stream.moveCursor(0, -1);
		this.stream.cursorTo(0);
		this.stream.write(str);
		this.stream.clearLine(1);	
	}
	this.endl = function(){
		this.stream.write("\n");
	}
}


var cli = new Cli();

cli.write("Hello, World");
setTimeout(function(){
	cli.write("Done.");
	cli.endl();
}, 1000);


