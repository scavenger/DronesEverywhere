var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var pathfinding = require("node-pathfinding");

var algorithms = require('explor/algorithms');
var Explorer = require('explor/explorer');
var SimplePlane = require('explor/graphs/simple-plane');
var Set = require('explor/node_modules/collections/set');

var cmdHOLD = 0, cmdUP = 1, cmdRIGHT = 2, cmdDOWN = 3, cmdLEFT = 4;

var datasetName = "04_gottaCircleAround.txt";

var graph = new SimplePlane();
var blocked = new Set();
// var start = {x:5, y:5};
// var goal = {x:-6, y:-6};
var framequeue = [];

var cetateni = [];
var fixe = [];

function block(x, y) {
	var node = graph.get({x:x, y:y});
	//blocked.add(node);
	graph.block(node);
}

function toggleBlock(x, y) {
	var node = graph.get({x:x, y:y});
	if (!blocked.has(node)) 
		blocked.add(node);
	else 
		blocked.delete(node);

 	graph.toggleBlock(node);	
}

var finalPath = [];
var generalFrame = 0;

function runExplor(mapData, start, end, inputData){

	framequeue = [];
	frameCnt = 0;
	graph = SimplePlane.fromString(mapData);
	//console.log(graph.blocked);

	var algorithm = algorithms["D*"];
	var heuristic = graph.heuristics["default"];

	console.log('start/end:');
	console.log(start);
	console.log(end);

	var currentData;


	function check() {
		//console.log('>run check...' + generalFrame);

		blocked.clear();
		graph.clear();
		var blockedNodes = getTempBlockedNodes(generalFrame, inputData);
		blockedNodes.forEach(function(el){
			block(el.x, el.y);
		});

  		var mapData = buildExplorMap(inputData, blockedNodes);
  		//console.log(mapData);		

		// graph.getSuccessors(bot.current).forEach(function (node) {
		// 	if (blocked.has(node)) {
		// 		graph.block(node);
		// 	}else
		// 	{
		// 		//graph.unblock(node);
		// 	}
		// })

		//console.log(finalPath);
	}

	function err(error) {
		console.log('GOT error!');
		console.error(error);
		//alert(error);
		//throw error;

		//var currentPosition = finalPath[finalPath.length - 2];
		finalPath.pop();
		//generalFrame++;
	}

	function addframe(data) {
		//console.log('>addframe:' + frameCnt);

		//console.log(data.path);
		framequeue.push(data);
		frameCnt++;
	}

	function step(data) {
		//console.log('>step');
		//console.log(data.current);

		currentData = finalPath.length == 0 ? start : finalPath[finalPath.length - 1];

		generalFrame++;
		finalPath.push(data.current);

		//addframe(data);
		var done = (data.current === data.goal);
		if (!done) 
			bot.step().then(step).progress(addframe).catch(function(error){
				finalPath[finalPath.length - 1] = currentData;

				//console.log('HALT');
				//console.log(finalPath)

				step(data);
			});
		else
		{
			finalPath.splice(0, 0, start);

			console.log('DONE!');
			console.log(finalPath);

			processPath(finalPath, inputData, mapData);			
		}
	}

	bot = new Explorer(start, end, graph, algorithm, heuristic);
	bot.on('step', check);
	bot.step().then(step).progress(addframe).catch(err);
	// bot.findPath().then(function(data){
	//  	console.log('ALL done!');

	//  	data.path.splice(0, 0, start);
	//  	console.log(data.path);

	//  	processPath(data.path, inputData, mapData);
	//  }).catch(err);
}

fs.readFile('data/' + datasetName, 'utf8', function (err, data) {
  	if (err) throw err;
  	var inputData = JSON.parse(data);

	inputData.map.objects.forEach(function(el){
		if(el.type == "Cetatean"){
			cetateni.push(el);
		}
		else if(el.type == "Obstacle"){
			fixe.push(el);
		}
	});

   	var blockedNodes = getTempBlockedNodes(0, inputData);
  	var mapData = buildExplorMap(inputData, blockedNodes);
  	console.log(mapData);

	//mapData = buildMap(inputData);
  	//console.log(mapData);

  	runExplor(mapData, inputData.simulatedDrone.position, inputData.map.target, inputData);

  	return;

	var path = getPath(mapData, inputData.map.cols, inputData.map.rows, inputData.simulatedDrone.position, inputData.map.target);
	console.log(path);
	console.log(inputData.simulatedDrone.position);

	processPath(path, inputData);
});

function getTempBlockedNodes(frame, inputData){
	var blockedNodes = fixe.map(function(el){
		return {x: el.position.x, y: el.position.y};
	});


	cetateni.forEach(function(el){
		var currentPosition = {x: el.position.x, y: el.position.y};
		switch(el.direction){
			case "RIGHT":
				//if(currentPosition.x + frame < inputData.map.cols)
					currentPosition.x += frame;
				//else
				//	currentPosition.x = inputData.map.cols - 1;
				break;
			case "LEFT":
				//if(currentPosition.x - frame >= 0)
					currentPosition.x -= frame;
				//else
				//	currentPosition.x = 0;
				break;
			case "DOWN":
				//if(currentPosition.y + frame < inputData.map.rows)
					currentPosition.y += frame;
				//else
				//	currentPosition.y = inputData.map.rows - 1;
				break;
			case "UP":
				//if(currentPosition.y - frame >= 0)
					currentPosition.y -= frame;
				//else
				//	currentPosition.y = 0;
				break;
		}

		//console.log(currentPosition);

		for(var dx = -3; dx <= 3; dx++){
			for(var dy = -3; dy <= 3; dy++){
				if(currentPosition.x + dx < 0 || currentPosition.x + dx >= inputData.map.cols ||
					currentPosition.y + dy < 0 || currentPosition.y + dy >= inputData.map.rows){
					continue;
				}

				var newNode = {x: currentPosition.x + dx, y: currentPosition.y + dy};
				blockedNodes.push(newNode);
			}
		}
	});

	return blockedNodes;
}

function processPath(path, inputData, mapData){
	// path.forEach(function(node){
	// 	mapData[node.y][node.x] = 8;
	// });
	// mapData[inputData.simulatedDrone.position.y][inputData.simulatedDrone.position.x] = 7;
	// mapData[inputData.map.target.y][inputData.map.target.x] = 9;
	// console.log(mapData);

	getCommandsFromPath(inputData, path);
}

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(index);
}).listen(3000);

function buildMap(inputData){
   var arr = [];
   for (var i = 0; i < inputData.map.cols; ++i){
      var columns = [];
      for (var j = 0; j < inputData.map.rows; ++j){
      	if(inputData.map.objects.find(function(el){
      		return el.position.x == j && el.position.y == i && el.type == "Obstacle";
      	})){
	        columns[j] = 1;
      	}else{
	        columns[j] = 0;      		
      	}
      }
      arr[i] = columns;
    }
    return arr;
}

function buildExplorMap(inputData, blockedNodes){
   var output = [];

   for (var i = 0; i < inputData.map.cols; ++i){
      for (var j = 0; j < inputData.map.rows; ++j){
      	if(blockedNodes.find(function(el){
      		return el.x == j && el.y == i;
      	})){
	        output += 'o';
      	}else{
	        output += '#';      		
      	}
      }
      output += '\n';
    }
    return output;
}

//cmdHOLD = 0, cmdUP = 1, cmdRIGHT = 2, cmdDOWN = 3, cmdLEFT = 4;
function getCommandName(cmd){
	switch(cmd){
		case 0:
			return "HALT";
		case 1:
			return "UP";
		case 2:
			return "RIGHT";
		case 3:
			return "DOWN";
		case 4:
			return "LEFT"
	}
}

function getCommandsFromPath(inputData, path){
	var commands = [];
	var lastCommand = -1, command = -1, cnt = 1;

	for(var i = 1; i < path.length; i++){
		if(path[i].x == path[i-1].x && path[i].y == path[i-1].y){
			command = cmdHOLD;
		}else if(path[i].x > path[i-1].x){
			command = cmdRIGHT;
		}
		else if(path[i].x < path[i-1].x){
			command = cmdLEFT;
		}
		else if(path[i].y > path[i-1].y){
			command = cmdDOWN;
		}
		else if(path[i].y < path[i-1].y){			
			command = cmdUP;
		}

		if(command == lastCommand){
			cnt++;
		}else{
			if(lastCommand != -1){
				commands.push({command: lastCommand, count: cnt, name: getCommandName(lastCommand)});
				cnt = 1;
			}
		}
		lastCommand = command;
	}

	commands.push({command: lastCommand, count: cnt, name: getCommandName(lastCommand)});

	console.log(commands);
	generateCPU(commands);
}

function getPath(array2d, width, height, start, end){
	var buf = pathfinding.bytesFrom2DArray(width, height, array2d);
	var grid = pathfinding.buildGrid(width, height, buf);
	 
	var path = pathfinding.findPath(start.x, start.y, end.x, end.y, grid);
	 
	var nicePath = path.map(function(el){
		return {x: el >> 16 & 0xFFFF, y: el & 0x0000FFFF};
	});

	//if(start.x != nicePath[0].x && start.y != nicePath[0].y){
		nicePath.splice(0, 0, start);
	//}

	//console.log(nicePath);	 
	return nicePath;
}

Array.prototype.find = function (predicate) {
    var list = Object(this);
    var length = list.length < 0 ? 0 : list.length >>> 0; // ES.ToUint32;
    if (length === 0) return null;
    if (typeof predicate !== 'function' || Object.prototype.toString.call(predicate) !== '[object Function]') {
        throw new TypeError('Array#find: predicate must be a function');
    }
    var thisArg = arguments[1];
    for (var i = 0, value; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) return value;
    }
    return null;
};

function generateCPU(commands){
	var output = "LDA [1000]\r\n";
	output += "JGE #init\r\n";
	output += "LDA 0\r\n";
	output += "JGE #process\r\n";
	output += "SUBA 1//@init\r\n";
	output += "STA [1000]\r\n";

	var i = 0;
	commands.forEach(function(cmd){
		output += "LDA " + (cmd.count - 1) + "\r\n";
		output += "STA [" + (3000 + i) + "]\r\n";
		output += "LDA " + cmd.command + "\r\n";
		output += "STA [" + (4000 + i) + "]\r\n";
		i++;
	});
	output += "LDA 3000\r\n";
	output += "STA [1001]\r\n";

	output += "LDN [1001]//@process\r\n";
	output += "LDA [N]\r\n";
	output += "JGE #incrementPas\r\n"; 
	output += "LDA [1001]//@incrementTip\r\n";
	output += "ADDA 1\r\n";
	output += "STA [1001]\r\n";
	output += "LDA 0\r\n";
	output += "JGE #process\r\n";
	output += "SUBA 1//@incrementPas\r\n";
	output += "STA [N]\r\n";
	output += "LDA [1001]\r\n";
	output += "ADDA 1000\r\n";
	output += "STA [1002]\r\n";
	output += "LDN [1002]\r\n";
	output += "LDA [N]\r\n";
	output += "STA [0]\r\n";
	output += "HLT//@halt";

	var allMatches = findMatches(output, /(?:\/\/@([a-zA-Z]+))+/);
	console.log(allMatches);

	// replace line markers
	output = output.replace(/(?:#([a-zA-Z]+))+/gm, function (match, capture) {
		return allMatches[capture];
	});

	// cleanup
	output = output.replace(/(?:\/\/@([a-zA-Z]+))+/gm, function (match, capture) {
		return "";
	});	

	fs.writeFile("output/" + datasetName, output, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}

function findMatches(text, pattern) {
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