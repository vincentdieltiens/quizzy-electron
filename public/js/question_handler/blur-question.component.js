module.exports.BlurQuestionComponent = {
	bindings: {
		question: '=',
		preloaded: '&',
		setCtrl: '&'
		//game: '='
	},
	controllerAs: '$ctrl',
	controller: ['$scope', '$q', '$timeout', '$element', function($scope, $q, $timeout, $element) {
		let  img = $element[0].querySelector('img');

		console.log('init........', this.question)

		let $ctrl = this;
		let started = false;
		this.setCtrl({
			ctrl: {
				play: () => {
					console.log('play ==> running')
					//img.style.webkitAnimationPlayState = 'running';
					//img.style.animationPlayState = 'running';
					img.classList.remove('paused')
					howl.play();
					howl.fade(0, 1, 1000);
				},
				pause: () => {
					console.log('pause ==> pause')
					//img.style.webkitAnimationPlayState = 'paused';
					//img.style.animationPlayState = 'paused';
					img.classList.add('paused')
					howl.pause();
				},
				stop: function() {
					//img.style.animationName = 'none';
					//img.style.webkitAnimationName = 'none';
					howl.on('fade', function onfade() {
						howl.stop();
						howl.off('fade', onfade);
					});
					howl.fade(1, 0, 1000)
				},
				unload: function() {
					console.log('unload')
					this.stop();
					howl.unload();
				}
			}
		});

		// Preload mp3 file and call preloaded when it's done !
		let i = (Math.floor(Math.random() * 12) + 1);
		let howl = new Howl({
			src: __dirname + '/../../sounds/image_background_0'+i+'.mp3',
			preload: true,
			html: 5,
			onload: () => {

				var img = new Image();
				img.onload = function() {
					$ctrl.preloaded();
				}
				img.src = this.question.file;
				
			}
		});

	}],
	template: '<div class="result">'+
		'<img class="img-responsive blur-image paused" ng-src="{{$ctrl.question.file}}" />'+
	'</div>'
}