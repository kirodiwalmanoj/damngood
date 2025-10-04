document.addEventListener('DOMContentLoaded', function(){

	/* Credits
	======================================== */
	console.log('ProdCo: code by Carlos Mayo (https://carlosmayo.info/)');

	/* Consts
	======================================== */
	const
		body = $('body'),
		isTouchDevice = () => {
			return(
				('ontouchstart' in window) ||
				(navigator.maxTouchPoints > 0) ||
				(navigator.msMaxTouchPoints > 0)
			);
		};

	/* Easing
	======================================== */
	const
		speed = 300,
		ease  = 'easeInOutQuint';

	/* Height viewport
	======================================== */
	function heightViewport(){
		document.documentElement.style.setProperty(
			'--h', window.innerHeight + 'px'
		);
	}
	heightViewport()

	/* Device detection
	======================================== */
	const isMobile = function(){
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || navigator.vendor || window.opera) || isTouchDevice() == true
	}

	// Mobile
	if(isMobile() == true){

		// Selector
		body.addClass('mobile');

		// Pseudoclass :active on devices
		document.addEventListener('touchstart', function(){}, {passive: true});

		// Resize functions
		window.addEventListener('orientationchange', function(){
			setTimeout(function(){
				heightViewport()
			}, 50);
		});

	// Desktop
	}else{

		// Selector
		body.addClass('desktop');

		// Resize functions
		window.onresize = function(){
			heightViewport()
		}

	}

	/* Landing
	======================================== */
	const landing = $('#landing');
	if(landing.length){
		function hideLanding(){
			if(sessionStorage.getItem('intro') != 'false'){
				landing.fadeOut(speed*2, function(){
					sessionStorage.setItem('intro', false);
				});
			}
		}
		if(sessionStorage.getItem('intro') == 'false'){
			landing.remove();
		}else{
			let time = setTimeout(function(){
				hideLanding();
			}, 3000);
			landing.click(function(){
				clearInterval(time);
				hideLanding();
			});
		}
	}

	/* Cookies
	==================================== */
	const cookies = $('#cookies-bar');
	if(localStorage.getItem('cookies')){
		cookies.remove();
	}
	$('.cookies-trigger').click(function(){
		let choice = $(this).attr('id');
		cookies.slideToggle(speed*2, ease, function(){
			localStorage.setItem('cookies', choice);
		});
	})

	/* Reset path
	======================================== */
	function resetPath(symbol){
		if(window.location.search.length){
			let path = window.location.href.split(symbol)[0];
			window.history.pushState({}, '', path);
		}
	}
	function pushUrl(symbol, t, slug){
		resetPath(symbol);
		if(!t.hasClass('active')){
			window.history.pushState({}, '', window.location.href+symbol+slug);
		}
	}
	function checkLastSection(){
		if($('.module-director--title.active').length == 1){
			resetToggleAll($('.module-director--title.active').data('slug'));
			checkLastBlock();
		}
	}
	function checkLastBlock(){
		if($('.module-director--block-title.active').length == 1){
			resetPath('&');
			window.history.pushState({}, '', window.location.href+'&'+$('.module-director--block-title.active').data('slug'));
		}
	}

	/* Toggle: expand all
	======================================== */
	const all = $('#toggle-all');
	all.click(function(){
		let t = $(this);
		let directorTitle = $('.module-director--title');
		let directorContent = $('.module-director--content');
		let blockTitle = $('.module-director--block-title');
		let blockContent = $('.module-director--block-content.has-title');

		if(!body.hasClass('transition')){
			resetPath('?');
			body.addClass('transition');
			t.toggleClass('active');
			if(!t.hasClass('active')){
				t.find('span').text('EXPAND ALL');
				directorTitle.removeClass('active');
				directorContent.slideUp(speed*2, ease);
				setTimeout(function(){
					blockTitle.removeClass('active');
					blockContent.hide();
					body.removeClass('transition');
				}, speed*2);
			}else{
				t.find('span').text('CLOSE ALL');
				window.history.pushState({}, '', window.location.href+'?view-all');

				if(directorContent.filter(':visible').length){
					directorContent.filter(':visible').find(blockContent).not(':visible').slideDown(speed*2, ease);
				}

				directorTitle.addClass('active');
				blockTitle.addClass('active');
				directorContent.not(':visible').find(blockContent).show();
				directorContent.not(':visible').slideDown(speed*2, ease);

				setTimeout(function(){
					body.removeClass('transition');
				}, speed*2);

			}
		}

	});
	function resetToggleAll(slug){
		resetPath('?');
		window.history.pushState({}, '', window.location.href+'?'+slug);
		all.removeClass('active').find('span').text('EXPAND ALL');
	}

	/* Toggle content
	=================================== */
	function toggleSection(t, n){
		t.toggleClass('active');
		n.slideToggle(speed*2, ease, function(){
			body.removeClass('transition');
		});
		if(!t.hasClass('active')){
			if(n.is('.module-director--content')){
				n.find('.module-director--block-title')?.removeClass('active');
				setTimeout(function(){
					n.find('.module-director--block-content.has-title')?.hide();
				}, speed*2);
			}
		}
	}
	function hideSections(t, n){
		$('.module-director--title').removeClass('active');
		$('.module-director--content:visible').slideUp(speed*2, ease, function(){
			$(this).find('.module-director--block-title')?.removeClass('active');
			$(this).find('.module-director--block-content.has-title')?.hide();
		});
		setTimeout(function(){
			toggleSection(t, n);
		}, speed*2);
	}
	function hideBlocks(t, n){
		$('.module-director--block-title').removeClass('active');
		$('.module-director--block-content.has-title:visible').slideUp(speed*2, ease);
		setTimeout(function(){
			toggleSection(t, n);
		}, speed*2);
	}

	/* Toggle: directors
	==================================== */
	$('.module-director--title').each(function(){
		let t = $(this);
		let n = t.next('.module-director--content');
		let slug = t.data('slug');
		t.click(function(){
			if(n.length && !body.hasClass('transition')){
				body.addClass('transition');
				if(!all.hasClass('active')){
					pushUrl('?', t, slug);
					if($('.module-director--content').not(n).is(':visible')){
						hideSections(t, n);
					}else{
						toggleSection(t, n);
					}
				}else{
					if(t.hasClass('active')){
						toggleSection(t, n);
						checkLastSection();
					}else{
						resetToggleAll(slug);
						hideSections(t, n);
					}
				}
			}
		});
	});

	/* Toggle: blocks
	==================================== */
	$('.module-director--block-title').each(function(){
		let t = $(this);
		let n = t.next('.module-director--block-content');
		let slug = t.data('slug');
		t.click(function(){
			if(n.length && !body.hasClass('transition')){
				body.addClass('transition');
				if(!all.hasClass('active')){
					pushUrl('&', t, slug);
					if($('.module-director--block-content.has-title').not(n).is(':visible')){
						if(t.hasClass('active')){
							toggleSection(t, n);
							checkLastBlock();
						}else{
							hideBlocks(t, n);
						}
					}else{
						toggleSection(t, n);
					}
				}else{
					if(t.hasClass('active')){
						toggleSection(t, n);
					}else{
						let parent = t.closest('.module-director');
						let title = parent.find('.module-director--title.active');
						let section = parent.find('.module-director--content');
						resetToggleAll(title.data('slug')+'&'+slug);
						$('.module-director--title').not(title).removeClass('active');
						$('.module-director--content:visible').not(section).slideUp(speed*2, ease, function(){
							$(this).find('.module-director--block-title')?.removeClass('active');
							$(this).find('.module-director--block-content.has-title')?.hide();
						});
						section.find('.module-director--block-title').not(t).removeClass('active');
						section.find('.module-director--block-content.has-title:visible').not(n).slideUp(speed*2, ease);
						setTimeout(function(){
							toggleSection(t, n);
						}, speed*2);

					}
				}
			}
		});
	});

	/* Toggle: B/N
	==================================== */
	if(sessionStorage.getItem('dark-mode') === 'true'){
		body.addClass('dark-mode');
		$('#toggle-mode div[data-color="black"]')
			.addClass('active')
				.siblings()
					.removeClass('active');
	}
	$('#toggle-mode > span').click(function(){
		let t = $(this);
		t.addClass('active')
			.siblings()
				.removeClass('active')
		if(t.data('color') == 'black'){
			body.addClass('dark-mode');
			sessionStorage.setItem('dark-mode', true);
		}else
		if(t.data('color') == 'white'){
			body.removeClass('dark-mode');
			sessionStorage.setItem('dark-mode', false);
		}
	});

	/* Lazy Loading
	==================================== */
	function lazyLoading(t){
		if(t.tagName == 'IMG'){
			t.src = t.dataset.src;
			t.classList.remove('lazy');
		}
		if(t.tagName == 'VIDEO'){
			let playPromise = t.play();
			if(playPromise !== undefined){
				playPromise.then(_ => {
					t.classList.remove('lazy');
				}).catch(error => {
					console.log(error);
					if($(t).hasClass('gif')){
						t.classList.add('no-autoplay');
					}else{
						t.classList.add('controls');
						t.controls = true;
					}
				});
			}
		}
	}

	/* Observer Functions
	======================================== */
	let lazies = [].slice.call(document.querySelectorAll('.lazy'));
	if('IntersectionObserver' in window){
		let observer = new IntersectionObserver(function(entries){
			entries.forEach(function(entry){
				if(entry.isIntersecting){
					let target = entry.target;
					lazyLoading(target);
					observer.unobserve(target);
				}
			});
		});
		lazies.forEach(function(target){
			observer.observe(target);
		});
	}else{
		lazies.forEach(function(target){
			lazyLoading(target);
		});
	}

});

/*404*/
$.ajax({
	statusCode:{
		404: function(){
			window.location = window.location.origin;
		}
	}
});