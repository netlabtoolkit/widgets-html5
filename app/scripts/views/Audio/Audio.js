define([
	'backbone',
	'rivets',
	'views/item/WidgetMulti',
	'text!./template.js',
],
function(Backbone, rivets, WidgetView, Template){
    'use strict';

	return WidgetView.extend({
		typeID: 'Audio',
		className: 'audio',
		template: _.template(Template),
		sources: [],
        widgetEvents: {
			'change #loop': 'loopChange',
            'change #continuous': 'continuousChange',
		},

		initialize: function(options) {
			WidgetView.prototype.initialize.call(this, options);

			this.model.set({
                src: 'assets/audio/slowDrums.mp3',
				ins: [
					{title: 'Play', to: 'play'},
					{title: 'Volume', to: 'volume'},
                    {title: 'Speed', to: 'speed'},
				],
				title: 'Audio',

				play: 0,
                playText: "Pause",
				toggle: 0,
                volume: 100.0,
				speed: 100.0,
                loop: false,
                continuous: false,
			});
            
            this.playing = false;
                    
            this.domReady = false;
            
		},
        
        onRender: function() {
			WidgetView.prototype.onRender.call(this);
			var self = this;   
            if(!app.server) {
                this.$("#audio")[0].loop = this.model.get('loop');
                if (this.model.get('continuous')) {
                    this.playing = true;
                    this.$("#audio")[0].play();
                    this.model.set('playText',"Play");
                }
                this.domReady = true;
            }
		},
                    
        onModelChange: function(model) {
            if (this.domReady) {
                if(!app.server && (model.changedAttributes().play || model.changedAttributes().volume || model.changedAttributes().speed)) {
                    var play = parseInt(this.model.get('play'),10);
                    var volume = Math.min(parseFloat(this.model.get('volume')) / 100,1.0);
                    var speed = parseFloat(this.model.get('speed')) / 100;

                    var audioEl = this.$("#audio")[0];

                    if (model.changedAttributes().play) {
                        if (!this.model.get('continuous')) {
                            if (play >= 500 && !this.playing) {
                                this.playing = true;
                                audioEl.play();
                                this.model.set('playText',"Play");
                            } else if (play < 500 && this.playing) {
                                this.playing = false;
                                audioEl.pause();
                                this.model.set('playText',"Pause");
                            }
                        }
                    }
                    
                    if (model.changedAttributes().volume) {
                        audioEl.volume = volume;
                    }

                    if (model.changedAttributes().speed) {
                        audioEl.playbackRate = speed;
                    }
                }
            }
            
        },
        
        loopChange: function(e) {
            if(!app.server) {
                this.$("#audio")[0].loop = this.model.get('loop');
            }
        },
            
        continuousChange: function(e) {
            if (!app.server && this.model.get('continuous')) {
                this.playing = true;
                this.$("#audio")[0].play();
                this.model.set('playText',"Play");
                
            }
        },

	});
});


