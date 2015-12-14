var fs = require('fs');
var datasetName = "04_gottaCircleAround.txt";

var out = "";
var nl = "\r\n";

var condCnt = 0;
var jnzCnt = 0;

var regCompare = 1000;
var regMF = 1001;
var regEF = 1002;
var regZF = 1003;

var regECX = 1004;

// http://www.tutorialspoint.com/assembly_programming/assembly_loops.htm
// https://github.com/nguyenchanhtruc2005/Path-Planning-Algorithms

function CMP(dest, src, checkZF){

	// resetez flags
	out += "LDA -1" + nl;
	out += "STA [" + regMF + "]" + nl;
	out += "STA [" + regEF + "]" + nl;
	out += "STA [" + regZF + "]" + nl;

	// fac diferenta dest-src
	out += "LDA " + dest + nl;
	out += "SUBA " + src + nl;
	out += "STA [" + regCompare + "]" + nl;
	out += "JGE #falseMF" + condCnt + nl;

	out += "LDA 0" + nl;
	out += "STA [" + regMF + "]" + nl;
	out += "JGE #exitCMP" + condCnt + nl;
	out += "LDA 0//@falseMF" + condCnt + nl;
	out += "SUBA [" + regCompare + "]" + nl;
	out += "JGE #trueEF" + condCnt + nl;
	out += "LDA 0" + nl;
	out += "JGE #exitCMP" + condCnt + nl;
	out += "LDA 0//@trueEF" + condCnt + nl;
	out += "STA [" + regEF + "]" + nl;

	if(checkZF){
		out += "LDA " + src + nl;
		out += "JGE #checkZF" + condCnt + nl;
		out += "LDA 0" + nl;
		out += "JGE #exitCMP" + condCnt + nl;
		out += "LDA 0//@checkZF" + condCnt + nl;
		out += "SUBA " + src + nl;
		out += "JGE #trueZF" + condCnt + nl;
		out += "LDA 0" + nl;
		out += "JGE #exitCMP" + condCnt + nl;
		out += "STA [" + regZF + "]//@trueZF" + condCnt + nl;
	}

	out += "NOP//@exitCMP" + condCnt + nl;

	condCnt++;
}

function JE(label){
	out += "LDA [" + regEF + "]" + nl; 
	out += "JGE " + label + nl;
}

function JMP(label){
	out += "LDA 0" + nl;
	out += "JGE " + label + nl;
}

function JNZ(label){
	out += "LDA [" + regZF + "]" + nl;
	out += "JGE #exitJNZ" + jnzCnt + nl;
	out += "LDA 0" + nl;
	out += "JGE " + label + nl;
	out += "NOP//@exitJNZ" + jnzCnt + nl;

	jnzCnt++; 
}

function MOV(address, value){
	out += "LDA " + value + nl;
	out += "STA [" + address + "]" + nl;
}


function Loop(n, innerBlock, innerLabel){

	MOV(regECX, 10);
	out += innerBlock;
	out += "LDA [" + regECX + "]" + nl;
	out += "SUBA 1" + nl;
	out += "STA [" + regECX + "]" + nl;
	CMP("["+ regECX + "]", 0, false);
	JNZ(innerLabel);
}

function writeCode(){
	//CMP(0, 0, true);

	Loop(2, "STA [0]//@innerLabel1" + nl, "#innerLabel1");

	out += "HLT";

	resolveReferences();
	console.log(out);
}

writeCode();

function resolveReferences(){

	var findMatches = function(text, pattern) {
	    var matchingLines = {};
	    var allLines = text.split("\r\n");

	    for (var i = 0; i < allLines.length; i++) {
	    	var currentMatch = allLines[i].match(pattern);
	        if (allLines[i].match(pattern)) {
	            matchingLines[currentMatch[1]] = i;
	        }
	    }

	    return matchingLines;
	}

	var allMatches = findMatches(out, /(?:\/\/@([a-zA-Z0-9]+))+/);
	console.log("matches:");
	console.log(allMatches);

	// replace line markers
	out = out.replace(/(?:#([a-zA-Z0-9]+))+/gm, function (match, capture) {
		return allMatches[capture];
	});

	// cleanup
	out = out.replace(/(?:\/\/@([a-zA-Z0-9]+))+/gm, function (match, capture) {
		return "";
	});	

	fs.writeFile("output/" + datasetName, out, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}