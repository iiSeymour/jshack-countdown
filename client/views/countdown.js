$(function () {

    var socket = io.connect(window.location.hostname + ':3001');

    function generateTimer(label, duration) {
	
	$('#countdown').empty();

	$('#countdown-label').html(label)
	
	new Countdown({
	    time: (duration / 1000) / 2, 
	    rangeHi  : "second",
	    hideLabels: true,
	    target: "countdown",
	    width: $('#countdown').width()
	});

    }

    $("#letter-game-results").hide();
    
    $('#submit-solution').on('click', function(e) {
	
	e.preventDefault();
	
	var solution = $('#solution').val();
	var name = $('#player-name').val();
	
	console.log('submitting solution!', solution, name);

        socket.emit('letters-solution', {
	    'game': $('#countdown-label').html(),
	    'solution': solution.toUpperCase(), 
	    'id': 1,
	    'player-name': name
	});

	var solution = $('#solution').val("");

    });

    socket.on('letters-game', function(data) { 

	$('#current-game').text(data.letters);

	$("#letter-game-results").hide();

	generateTimer(data.letters, data.duration);

    });

    socket.on('letters-game-results', function(data) { 
	
	$("#letter-game-results").show();

	generateTimer("", data.duration);

        $("#results-table").dataTable({
            "data": data.results,
            "columns": [
                { "title": "Name", "data": "player-name" },
                { "title": "Solution", "data": "solution" },
                { "title": "", "data": "valid" },
            ],
            "bDestroy" : true,
	    "bSort": false,
	    "bLengthChange": false,
	    "bFilter": false,
	    "sDom": ""
        });

    });
    
})
