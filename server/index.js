var http = require('http')
var fs = require('fs');

var gameId = 1
var duration = 30000
var wordsFile = '/usr/share/dict/words'
var words = fs.readFileSync(wordsFile).toString().split("\n");

var lookup = {};

words.forEach(function(word) {
    lookup[word.toUpperCase()] = 1;
})

var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("ws server");
});

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {

    socket.emit('welcome', { message: 'Welcome!' });

    socket.on('letters-solution', function(data) {
	solutionMessages.results.push(data);
    });

});

var solutionMessages = {results: [], duration: duration};

function shuffle(o){
    // randomly shuffle array
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


function generateLettersGame() {

    var text = "";

    var vowels = "AEIOU"
    var consonants = "BCDFGHJKLMNPQRSTVWXYZ";

    for (var i = 0; i < 3; i++) {
        text += vowels.charAt(Math.floor(Math.random() * vowels.length));
    }

    for (var i = 0; i < 6; i++) {
        text += consonants.charAt(Math.floor(Math.random() * consonants.length));
    }

    text = shuffle(text.split("")).join("");

    return {
	'letters': text,
	'id': gameId++,
	'duration': duration
    };
}

function lenSort(a, b) {
    // sort by length of string
    if (a.solution.length < b.solution.length)
	return 1;
    if (a.solution.length > b.solution.length)
	return -1;
    return 0;

}

function validateSolution (data) {

    // solution must:
    //  - use letters from the current game only
    //  - not have repeated use of letters beyond the frequency in the current game
    //  - be at least one letter in length and no more than 9 letters
    //  - be found in the wordsFile

    var allowedChars = new RegExp("^[" + data.game + "]{1,9}$");
    var valid = !!data.solution.match(allowedChars);

    // check frequencies
    if (valid) {

        var gameChars = data.game.split("");    
        var solutionChars = data.solution.split("");

        solutionChars.forEach(function (chr) {
            
            var gameCount = gameChars.filter(function (val) { return val == chr} ).length;
            var solutionCount = solutionChars.filter(function (val) { return val == chr} ).length;

            if (solutionCount > gameCount && valid) {
                valid = false;
            }   
        })
    } 
    
    // check work in wordsFile lookup hash
    if (valid) {
        valid = !!lookup[data.solution];
    }

    data.valid = valid ? '✓' : '✗'; 
    
    return valid
    
}

function calResults() {

    // validate results
    solutionMessages.results.forEach(validateSolution);

    // sort the solutions by longest words
    solutionMessages.results.sort(lenSort);
    return solutionMessages;
}


function game() {

    // clear previous solutions from last game
    solutionMessages.results.splice(0, solutionMessages.results.length);

    // generate game and broadcast to everybody
    var game = generateLettersGame();
    io.sockets.emit('letters-game', game);
    console.log(game);
    
    // wait (duration / 2) seconds and broadcast results
    setTimeout(function() {
        io.sockets.emit('letters-game-results', calResults());
    }, duration / 2);

}

game();
setInterval(game, duration);    

app.listen(3001);
