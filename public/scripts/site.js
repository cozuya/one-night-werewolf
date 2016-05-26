$(document).ready(function () {
	$('body').on('click', '#signup', function(event) {
		event.preventDefault();

		$('section.signup-modal')
			.modal('setting', 'transition', 'horizontal flip')
			.modal('show');
	});

	$('button.signup-submit').on('click', function(event) {
		event.preventDefault();
		let username = $('#signup-username').val(),
			password = $('#signup-password').val(),
			$loader = $(this).next(),
			$message = $loader.next(),
			submitErr = (message) => {
				$loader.removeClass('active');
				$message.text(message).removeClass('hidden');
			};

		$loader.addClass('active');

		$.ajax({
			url: '/account/signup',
			method: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify({username, password}),
			statusCode: {
				200() {
					if (window.location.pathname === '/observe') {
						window.location.pathname = '/game';
					} else {
						window.location.reload();
					}
				},
				400() {
					submitErr('Sorry, that request did not look right.');
				},
				401(xhr) {
					let message = typeof xhr.responseJSON !== 'undefined' ? xhr.responseJSON.message : 'Sorry, that username already exists and you did not provide the correct password.';

					submitErr(message);
				}
			}
		});
	});

	$('body').on('click', '#signin', function(event) {
		event.preventDefault();

		$('section.signin-modal')
			.modal('setting', 'transition', 'horizontal flip')
			.modal('show');
	});

	$('body').on('focus', '#signup-username', function () {
		$(this).parent().next().text('3-12 alphanumeric characters.').slideDown();
	});

	$('body').on('focus', '#signup-password', function () {
		$(this).parent().next().text('6-50 characters.').slideDown();
	});	

	$('body').on('blur', '.signup-modal .ui.left.icon.input input', function () {
		$(this).parent().next().slideUp();
	});

	$('button.signin-submit').on('click', function(event) {
		event.preventDefault();
		let username = $('#signin-username').val(),
			password = $('#signin-password').val(),
			$loader = $(this).next(),
			$message = $(this).next().next(),
			submitErr = (message) => {
				$loader.removeClass('active');
				$message.text(message).removeClass('hidden');
			};

		$loader.addClass('active');

		$.ajax({
			url: '/account/signin',
			method: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify({username, password}),
			statusCode: {
				200() {
					if (window.location.pathname === '/observe') {
						window.location.pathname = '/game';
					} else {
						window.location.reload();
					}
				},
				400() {
					submitErr('Sorry, that request did not look right.');
				},
				401() {
					submitErr('Sorry, that was not the correct password for that username.');
				}
			}
		});
	});

	$('a#logout').on('click', function(event) {
		event.preventDefault();
		
		$.ajax({
			url: '/account/logout',
			method: 'POST',
			success() {
				window.location.reload();
			}
		});
	});

	$('button#change-password').on('click', function(event) {
		$('section.passwordchange-modal')
			.modal('setting', 'transition', 'horizontal flip')
			.modal('show');
	});

	$('button#passwordchange-submit').on('click', function (event) {
		event.preventDefault();
		
		let newPassword = $('#passwordchange-password').val(),
			newPasswordConfirm = $('#passwordchange-confirmpassword').val(),
			$loader = $(this).next(),
			$errMessage = $loader.next(),
			$successMessage = $errMessage.next(),
			data = JSON.stringify({
				newPassword,
				newPasswordConfirm
			});

		$loader.addClass('active');
		
		$.ajax({
			url: '/account/change-password',
			method: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data,
			statusCode: {
				200() {
					$loader.removeClass('active');
					$successMessage.removeClass('hidden');
					if (!$errMessage.hasClass('hidden')) {
						$errMessage.addClass('hidden');
					}

				},
				401() {
					$loader.removeClass('active');
					$errMessage.text('Your new password and your confirm password did not match.').removeClass('hidden');
					if (!$successMessage.hasClass('hidden')) {
						$successMessage.addClass('hidden');
					}
				}
			}
		});
	});	

	$('button#delete-account').on('click', function(event) {
		$('section.deleteaccount-modal')
			.modal('setting', 'transition', 'horizontal flip')
			.modal('show');
	});

	$('button#deleteaccount-submit').on('click', function (event) {
		return; // todo-release
		event.preventDefault();
		
		let password = $('#deleteaccount-password').val(),
			$loader = $(this).next(),
			$errMessage = $loader.next(),
			$successMessage = $errMessage.next(),
			data = JSON.stringify({password});

		$loader.addClass('active');

		$.ajax({
			url: '/account/delete-account',
			method: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data,
			statusCode: {
				200() {
					$loader.removeClass('active');
					$successMessage.removeClass('hidden');
					setTimeout(function () {
						window.location.reload();
					}, 3000);
					if (!$errMessage.hasClass('hidden')) {
						$errMessage.addClass('hidden');
					}
				},
				400() {
					$loader.removeClass('active');
					$errMessage.text('Your password did not match.').removeClass('hidden');
					if (!$successMessage.hasClass('hidden')) {
						$successMessage.addClass('hidden');
					}
				}
			}
		});
	});	
});