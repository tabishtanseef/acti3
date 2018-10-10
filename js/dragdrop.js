/*
* Author: Ashok Shah
* https://www.shahnashok.com
* Date: 16/09/2017
*/
var Screen = 0;

var items;
var container;
var itemContainer;
var footerContainer;
var feedbackTracker;
var attempt;
var lastDrag;
	
$(document).ready(function(e) {
	
    container = "#drop-container";
    itemContainer = "#container-items-box";
	footerContainer = "#btn-wrapper-holder";
	feedbackTracker;
	attempt = 0;
	lastDrag;
	init();
	
		//init function
	
	function checkAnswers()
	{
		$.each(items, function(index, value)
		{
			var id = items[index][0];
			var ans = items[index][1];
			var id_user = '#' + id;
            console.log(id + " : " + ans);
            $("#feedback-incorrect, #feedback-correct").hide();
			if(($(id_user).html().toLowerCase()) != ans.toLowerCase())
			{
				$(id_user).addClass('ans-incorrect');
                //$("#feedback-image").html('<img src="img/incorrect_Img.gif">');
                //$("#feedback-incorrect").show();
                
			} else {
				//$("#feedback-image").html('<img src="img/correct_Img.gif">');
                $(id_user).addClass('ans-correct');
                //$("#feedback-correct").show();
                
			}
			//$("#feedback-image").show();
			setTimeout(function(e) {
                $("#feedback-incorrect, #feedback-correct").hide();
			}, MASTER_DB.CONFIG.FEEDBACK_TIME);
		});
		if($('.ans-incorrect').length == 0) {
			actComplete();
			MasterApp.playAudio('audioCorrectList');
		} else {
			MasterApp.playAudio('audioIncorrectList');
			$("#btn-submit").attr('disabled', 'disabled');


			MASTER_DB.CONFIG.HINT--;
			if(MASTER_DB.CONFIG.HINT <= 0) {
				$("#btn-showAns").removeAttr("disabled");
			} else {
				$("#btn-tryagain").removeAttr("disabled");
			}
		}
	}	//checkAnswers function
	
});

function showAnswers()
{
	$("#app-instruction").hide();
	$("#screen-activity .sub-header").show();
	$("#container-items-box").hide();
	$(".ans-correct").removeClass("ans-correct").addClass('getAnswer');
	
	var str = '<table class = "answer_table"><tbody>';
	
	for(var i=1; i<=MASTER_DB.IMAGES.length; i++)
	{
		var answer='';
		
		str += '<tr><td id="first_col">'
		str += i + '.'
		str += '</td><td id="second_col">'
		str += '<img src=' + MASTER_DB.IMAGES[i-1] + '></img>'
		str += '</td><td id="third_col">'
		
		for(var n=1; n<=MASTER_DB.QUESTIONS[i-1].length; n++)
		{
			answer += MASTER_DB.QUESTIONS[i-1][n-1][1]; 		
		};
		
		str += answer
		str += '</td></tr>' 
	};
	
	 str += '</tbody></table>' 
	 
	$('#screen-result').append(str);
	
	//$("#screen-activity").show();
	//$("#screen-result").hide();
	$("#btn-showAns").attr('disabled', 'disabled');
	//actComplete();
}
	
function init() 
{
		
	$('.drop').remove();
	items = MASTER_DB.QUESTIONS[Screen];
	
	$(footerContainer).empty();
	
	$(itemContainer).empty()
	
	$('.center').attr('src', MASTER_DB.IMAGES[Screen])
	$("#feedback-correct").hide();
	
	$.each(items, function(index, value)
	{
		$('<div class="drop"></div>')
			.attr('id', items[index][0])
			.appendTo(container);

		if(items[index][2] == 'fixed')
		{
			
			$('#'+items[index][0]).css({
				'background': 'transparent',
				'border': 'none'
			})
			
			$('#'+items[index][0]).html(items[index][1]);
		}
		else 
		{
			$('<div class="item"></div>')
			.html(items[index][1])
			.appendTo(itemContainer);	
		}
	});
	
	$(itemContainer).find('.item').each(function(index, element) {
		var i = Math.floor(Math.random() * items.length);
		$(itemContainer).find('.item').eq(i).detach().prependTo(itemContainer);
	});

	//$('<div class="footer">').appendTo('.stage');
				
	$('<button class="btn btn-primary" id="btn-showAns">')
		.attr('disabled', 'disabled')
		.html('Answer Key')
		.bind('click', function(e)
		{
			showAnswers();
		})
		.appendTo(footerContainer);

	$('<button class="btn btn-primary" id="btn-hint">')
		.attr('disabled', 'disabled')
		.html('Answer')
		.bind('click', function(e)
		{
			attempt = 0;
			showHint(lastDrag);
		})
		.appendTo(footerContainer);

	$('<button class="btn btn-primary" id="btn-reset">')
		.html('Retry Activity')
		.attr('disabled', 'disabled')
		.bind('click', function(e)
		{
			//init();
			window.location.reload();
			
		})
		.appendTo(footerContainer);
		
	$('<button class="btn btn-primary" id="btn-tryagain">')
		.html('Try Again')
		.attr('disabled', 'disabled')
		.bind('click', function(e)
		{
			tryAgain();
		})
		.appendTo(footerContainer);
		
	
	$('.item').draggable(
	{
		containment: ".stage",
		revert: 'invalid',
		revertDuration: 600
	});
	
	$('.drop').droppable(
	{
		//activeClass: "itemHover",
		//hoverClass: "drop-hover",
		accept: '.item',
		drop: function(event, ui)
		{
			var userAns = $(ui.draggable).html();
			var ans = getAns(items, this.id);
			$("#feedback-incorrect, #feedback-correct").hide();
			lastDrag = $(ui.draggable);
			if(userAns != ans) {
				$(ui.draggable).draggable('option', 'revert', true);
				//MasterApp.playAudio('audioIncorrectList');
				//$("#feedback-incorrect").show();
				attempt++;

				if(attempt >= MASTER_DB.CONFIG.HINT) {
					$("#btn-hint").removeAttr('disabled');
				}
			} else {
				attempt = 0;
				//MasterApp.playAudio('audioCorrectList');
				//$("#feedback-correct").show();
				$(this).html($(ui.draggable).html());
				$(ui.draggable).remove();
				$(this).droppable( "disable" );
				if($(itemContainer).is(':empty'))
				{
					actComplete();
					//$('#btn-submit').removeAttr('disabled');
				}
			}

			try {
				clearTimeout(feedbackTracker);
			} catch(err) {

			}
			feedbackTracker = setTimeout(function(e) {
				$("#feedback-incorrect, #feedback-correct").hide();
			}, MASTER_DB.CONFIG.FEEDBACK_TIME);
		}
	});


	$('<button class="btn btn-primary" id="btn-submit">')
		.html('Done')
		.attr('disabled', 'disabled')
		.bind('click', function(e)
		{
			checkAnswers();
			
		})
		.appendTo(footerContainer);

}
	
function actComplete() {
    $("#btn-submit, #btn-showAns").attr('disabled', 'disabled');
	
	MasterApp.playAudio('audioCorrectList');
	$("#feedback-correct").show();
		
	if(Screen == MASTER_DB.QUESTIONS.length-1)
	{
		setTimeout(function() {
			var index = MasterApp.playAudio('audioCompleteList');
			$("#completeText").html(MASTER_DB.COMPLETE.TEXT[0]);
	
			$("#btn-reset").removeAttr('disabled');
			$("#btn-showAns").removeAttr('disabled');
	
			$("#screen-activity").hide();
			$("#screen-result").show();
			$("#feedback-correct").hide();
		}, MASTER_DB.CONFIG.RESULT_TIME);
	}
	else 
	{
		Screen++;
		setTimeout(init, MASTER_DB.CONFIG.RESULT_TIME);
	}
}

function tryAgain() {
	$(".ans-incorrect").each(function(e) {
		$(this).removeClass('ans-incorrect');
		var value = this.textContent;
		this.textContent = "";
		$("#container-items-box").append('<div class="item">' + value + '</div>');
		$(this).droppable( "enable" );
	});
	$('.item').draggable(
	{
		containment: ".stage",
		revert: 'invalid',
		revertDuration: 600
	});
	$("#btn-tryagain, #btn-submit").attr('disabled', 'disabled');
}

function getAns(item, id) {
	var result;
	for(var i=0; i<item.length; i++) {
		if(id == item[i][0]) {
			result = item[i][1];
			break;
		}
	}
	return result;
}

function getId(item, ans) {
	var result;
	for(var i=0; i<item.length; i++) {
		if(ans == item[i][1]) {
			result = item[i][0];
			break;
		}
	}
	return result;
}

function showHint(lastDrag) {
	var ans = lastDrag.html();
	var id = getId(MASTER_DB.QUESTIONS, ans);
	$("#feedback-incorrect, #feedback-correct").hide();
	$('#' + id).html(ans);
	lastDrag.remove();
	$('#' + id).droppable( "disable" );
	$("#btn-hint").attr('disabled', 'disabled');
	if($("#container-items-box").is(':empty')) {
		actComplete();
	}
}