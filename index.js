var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var pathfinding = require("node-pathfinding");

var cmdHOLD = 0, cmdUP = 1, cmdRIGHT = 2, cmdDOWN = 3, cmdLEFT = 4;

fs.readFile('data/01_letsGetToKnowEachOther.txt', 'utf8', function (err, data) {
  	if (err) throw err;
  	var inputData = JSON.parse(data);

  	var mapData = buildMap(inputData);
  	console.log(mapData);

	var path = getPath(mapData, inputData.map.cols, inputData.map.rows, inputData.simulatedDrone.position, inputData.map.target);
	getCommandsFromPath(inputData, path);
});

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(index);

  loadAndProcessData();
}).listen(3000);

function buildMap(inputData){

   var arr = [];
   for (var i = 0; i < inputData.map.cols; ++i){
      var columns = [];
      for (var j = 0; j < inputData.map.rows; ++j){
      	if(inputData.map.objects.find(function(el){
      		return el.position.x == j && el.position.y == i;
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
		if(path[i].x > path[i-1].x){
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
}

function loadAndProcessData(){
	var array2d = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0]];
 	var width = 4, height = 5;

 	getPath(array2d, width, height, start, end);
}

function getPath(array2d, width, height, start, end){
	var buf = pathfinding.bytesFrom2DArray(width, height, array2d);
	var grid = pathfinding.buildGrid(width, height, buf);
	 
	var path = pathfinding.findPath(start.x, start.x, end.x, end.y, grid);
	 
	var nicePath = path.map(function(el){
		return {x: el >> 16 & 0xFFFF, y: el & 0x0000FFFF};
	});

	nicePath.splice(0, 0, start);

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