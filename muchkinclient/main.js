if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.lastIndexOf(str, 0) === 0
	};
}

$(document).ready(function() {
	var socket;

	var timer_update_speed = 50;

	setInterval(function() {
		$('.timer_bar').each(function() {
			var remaining = $(this).attr('remaining');

			if( !remaining ) {
				return;
			}

			remaining -= timer_update_speed;
			if( remaining < 0 ) {
				remaining = 0;
			}

			$(this).attr('remaining', remaining);
			$(this).css('width', (remaining / $(this).attr('total') * 100) + '%');
		})
		var remaining = $('.timer_bar').attr('remaining');
		$('.timer_bar')
	}, timer_update_speed);
	
	function add_player(player) {
		var new_player = $(".player.template").clone();
		new_player.removeClass("template");
		new_player.find(".player_name").text(player.name);
		new_player.attr("player_id", player.id);
		new_player.find(".player_level").text(player.level);
		new_player.find(".player_bonus").text(player.bonus);
		new_player.find(".player_total").text(player.total);

		for( var i in player.hand ) {
			new_player.find('.player_hand').append(create_card(player.hand[i]));
		}

		for( var i in player.carried ) {
			new_player.find('.player_carry').append(create_card(player.carried[i]));
		}

		existing_player = $('.player[player_id='+player.id+']');
		if( existing_player.length ) {
			existing_player.before(new_player);
			existing_player.remove()
		} else {
			$('#game_board').append(new_player);
		}
	};

	function set_players(players) {
		clear_players();

		for(var i in players) {
			add_player(players[i]);
		}
	};

	function clear_players() {
		$(".player").not(".template").remove();
	};

	function deal_card(player, card) {
		$(".player[player_id="+player+"] .player_hand").append(create_card(card));
	};

	function add_card_to_combat(card) {
		$(".combat .combat_monsters").append(create_card(card));
	}

	function remove_highlights() {
		$('.highlighted')
			.removeClass('highlighted')
			.removeClass('highlighted_target')
			.removeClass('highlighted_selected');
	}

	function highlight(elem, type) {
		var $elem = $(elem);
		$elem.addClass('highlighted');

		if( type == 'target' ) {
			$elem.addClass('highlighted_target');
			$elem.click(function() {
				var target_type;
				var target_id;
				if( $elem.hasClass('combat_players') ) {
					target_type = 'combat';
					target_id = 'players';
				}
				else if( $elem.hasClass('combat_monsters') ) {
					target_type = 'combat';
					target_id = 'monsters';
				}


				target_callback(target_type, target_id);
				remove_highlights();
			});

		}
	}

	function create_card(card) {
		var new_card = $('.card.template').clone();
		new_card.removeClass("template");
		new_card.css('background-image', 'url('+card.image+')');
		new_card.attr('card_id', card.id);

		new_card.find('.action_CARRY').click(function() {
			socket.send(JSON.stringify({
				'type': 'ACTION',
				'action': {
					'move_type': 'CARRY',
					'card':card.id,
					'target': null,
					'player': parseInt(new_card.parents('.player').attr('player_id')),
				}
			}));
		});
		new_card.find('.action_PLAY').click(function() {
			var targets = $(this).attr('targets');

			if( targets && (targets = targets.split(',')).length ) {
				for( var i in targets ) {
					var target = targets[i];

					if( target.startsWith('combat') ) {
						target = $('.'+target);
					}

					highlight(target, 'target');
					highlight(new_card, 'selected');
					target_callback = function(target_type, target_id) {
						socket.send(JSON.stringify({
							'type': 'ACTION',
							'action': {
								'move_type': 'PLAY',
								'card':card.id,
								'target': { 'type': target_type,
											'id': target_id },
								'player': parseInt(new_card.parents('.player').attr('player_id')),
							}
						}));
					}
				}
			}
		});

		return new_card;
	};

	$("#connect").click(function() {
		$('.console_message').remove();

		if (socket) {
			socket.close();
		}

		socket = new WebSocket("ws://localhost:800/socket/"+$("#username").val()+"/"+$("#game_name").val());

		socket.onopen = function(){
		};

		socket.onmessage = function(msg) {
			var msg = JSON.parse(msg.data);

			if (msg.type == "players") {
				set_players(msg.players);
			} else if (msg.type == "player") {
				add_player(msg.player);
			} else if (msg.type == "draw") {
				deal_card(msg.player, msg.card);
			} else if (msg.type == "timeout") {
				$('.timer_bar').attr('total', msg.timeout);
				$('.timer_bar').attr('remaining', msg.timeout);
			} else if (msg.type == "valid_moves") {
				$('.action').hide();
				for(var card_id in msg.moves) {
					var moves = msg.moves[card_id];

					for( var move_type in moves ) {
						var targets = moves[move_type];
						var action_button = $('.card[card_id='+card_id+'] .action_'+move_type);
						action_button.attr('targets', targets);
						action_button.show();
					}
				}
			} else if (msg.type == "message") {
				if( msg.message.from == "system" ) {
					$('#console').append($('<div class="console_message system_message">'+msg.message.text+'</div>'));
				}
			} else if (msg.type == "combat") {
				var combat = msg.combat;
				var players = combat.players;
				var monster_cards = combat.monster_cards;

				$('.combat_monsters .card').remove();
				$('.combat_player_detail').remove();

				for( var i in monster_cards ) {
					var card = monster_cards[i];
					add_card_to_combat(card);
				}
				
				for( var i in players ) {
					var player_id = players[i];
					var player = $('.player[player_id='+player_id+']');

					$('<span class="combat_player_detail">'+player.find('.player_name').text()+' ('+player.find('.player_total').text()+')</span>').appendTo($('.combat_players'));
				}
			}
		};

	});
});