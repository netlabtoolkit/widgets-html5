module.exports = function(five) {
	var pollIntervalMod = 1;

	var StandardFirmataModel = {
		addDefaultPins: function addDefaultPins() {
			self = this;
			// Store all pin mode mappings (string -> integer)
			this.PINMODES = this.board.io.MODES;

			var pollFreq = 100;

			for(var index in this.board.pins) {
				var reportedPin = this.board.pins[index];
				if(reportedPin.analogChannel < 127) {
					var sensor = five.Sensor({
						pin: "A"+reportedPin.analogChannel,
						freq: pollFreq,
					});

					sensor.scale([0, 1023]).on("data", function() {
						self.set("A"+this.pin, Math.floor(this.value));
					});

					this.inputs["A"+reportedPin.analogChannel] = {pin: sensor, value: 0};
				}
				else {
					//this.outputs["D"+index] = {pin: {}, value: 0, supportedModes: reportedPin.supportedModes};
					this.outputs["D"+index] = {pin: reportedPin,  value: 0, supportedModes: reportedPin.supportedModes};
				}
			}

		},
		get: function(field) {
			field = field.toUpperCase();
			return this.inputs[field].value;
		},
		set: function(field, value, modeRequested) {
			field = field.toUpperCase();
			value = parseInt(value, 10);

			if(this.inputs[field] != undefined) {

				if(parseInt(this.inputs[field].value, 10) !== parseInt( value, 10 )) {
					this.inputs[field].value = value;
					this.emit('change', {field: field, value: this.inputs[field].value});
				}
			}
			else if(this.outputs[field] !== undefined) {

				if(parseInt(this.outputs[field].value,10) !== parseInt(value,10)) {
					this.outputs[field].value = value;

					if(this.connected) {
						console.log('mode requested', modeRequested);
						this.setHardwarePin(field, value, modeRequested);
					}
				}
			}

			return this;
		},
		setHardwarePin: function(field, value, modeRequested) {
			field = field.toUpperCase();

			var outputField = this.outputs[field],
				modeSupported = false;

			if(outputField && outputField.pin) {
				//var pinMode = outputField.pin.mode;
				var pinMode = modeRequested;

				console.log('modeREquested', pinMode);
				// Check if this mode is supported on this pin
				for(var supportedMode in this.outputs[field].supportedModes) {
					// TODO: Casts a string in "supportMode" to an int for loose comparison.
					if(supportedMode == pinMode) {
						modeSupported = true;

						// TODO: PROBLEM. SOmetimes this is undefined
						if(this.outputs[field].pin.board == undefined) {
							var currentPinModeInteger = this.outputs[field].pin.mode;
						}
						else {
							var currentPinModeInteger = this.outputs[field].pin.board.pins[this.outputs[field].pin.pin].mode;
						}

						//if(parseInt(supportedMode,10) !== this.outputs[field].pin.mode) {
						if(parseInt(supportedMode,10) !== currentPinModeInteger) {
							console.log('mode', supportedMode, pinMode);
							var PINMODESTRINGS = _.invert(this.PINMODES);
							this.setIOMode(field, PINMODESTRINGS[supportedMode] );
						}
					}
				}

				// Doesn't even try if the pinmode is not supported.
				if(!modeSupported && pinMode !== undefined) { return false; }
			}


			if(outputField !== undefined) {

				// If we don't have the pinmode from the front end, then grab what it was previously
				if(pinMode == undefined) {
					if(outputField.pin.board == undefined) {
						pinMode = outputField.pin.mode;
					}
					else {
						pinMode = outputField.pin.board.pins[outputField.pin.pin].mode;
					}
				}

				// Check which pinmode is set on the pin to detemine which method to call
				if(pinMode === this.PINMODES.PWM) {
					console.log('brightness', field, value);
					this.outputs[field].pin.brightness(value);
				}
				else if(pinMode === this.PINMODES.OUTPUT) {
					if(value >= 255) {
						this.outputs[field].pin.on();
					}
					else {
						this.outputs[field].pin.off();
					}
				}
				else if(pinMode === this.PINMODES.SERVO) {
					console.log('servo');
					this.outputs[field].pin.to(value);
				}

				// For reference:
				//MODES:
				//{ INPUT: 0,
				//OUTPUT: 1,
				//ANALOG: 2,
				//PWM: 3,
				//SERVO: 4,
				//SHIFT: 5,
				//I2C: 6,
				//ONEWIRE: 7,
				//STEPPER: 8,
				//IGNORE: 127,
				//UNKOWN: 16 },

			}
		},
		setIOMode: function setPinMode(pin, mode) {
			pin = pin.toUpperCase();

			if(this.connected) {

				// Check if this mode is supported on this pin
				var modeSupported = false;

				var modeInt = this.PINMODES[mode];
				for(var supportedMode in this.outputs[pin].supportedModes) {
					if(this.outputs[pin].supportedModes[supportedMode] == modeInt) {
						modeSupported = true;
					}
				}

				// If we don't support this mode on this pin then immediately return
				if(!modeSupported && mode !== 4) { return false; }

				// Always immediately set an input to a Sensor. If it is already a sensor, then we are resetting it
				if(mode == 'INPUT') {
					var pinExists = (this.inputs[pin] !== undefined || this.outputs[pin] !== undefined);

					if(pinExists) {
						var hardwarePinNumber = pin.split('D')[1];
						// remove any listeners on the current pin
						//this.inputs[pin] && this.inputs[pin].pin.off('data');

						// delete this pin if it exists in the outputs
						delete this.outputs[pin].pin;

						var button = five.Button(hardwarePinNumber);

						var withinThrottleRange = false;
						button.on("press", function() {
							// Debounce and throttle button presses
							if(!withinThrottleRange) {
								withinThrottleRange = true;

								setTimeout(function() {
									withinThrottleRange = false;
								}, 25);

								self.set(pin, 1023);
							}

						}.bind(this) );
						button.on("release", function() {
							if(!withinThrottleRange) {
								withinThrottleRange = true;

								setTimeout(function() {
									withinThrottleRange = false;
								}, 25);

								self.set(pin, 0);
							}
						}.bind(this) );

						this.inputs[pin] = {pin: button, value: 0};
					}
				}
				else if(mode === 'ANALOG') {
				}
				else if(mode === 'PWM' || mode === 'OUTPUT') {
					var pinExists = this.outputs[pin] !== undefined;
					if(pinExists) {
						var currentPin = this.outputs[pin].pin;

						if( !(currentPin instanceof five.Led) ) {
							var hardwarePin = parseInt(pin.substr(1),10);

							var outputPin = five.Led(hardwarePin);
							this.outputs[pin].pin = outputPin;
						}
					}
				}
				else if(mode === 'SERVO') {
					var pinExists = this.outputs[pin] !== undefined;

					if(pinExists) {
						var hardwarePin = parseInt(pin.substr(1),10);

						var outputPin = five.Servo({
							pin: hardwarePin,
							range: [0,180],
						});

						this.outputs[pin].pin = outputPin;
					}
				}
				else if(mode === 'STEPPER') {
				}
				else if(mode === 'I2C') {
				}

			}
		},
		setPollSpeed: function(highLow) {
			if(highLow == 'fast') {
				pollIntervalMod = 1;
			}
			else {
				pollIntervalMod = 30;
			}
		},
		inputs: {},
		outputs: {},
	};

	return StandardFirmataModel;
};
