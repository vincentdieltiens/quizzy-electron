const HID = require('node-hid');

function callHandlers(handlers /*: Array<Function>*/, controllerIndex/*: number*/, buttonIndex/*: number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

/**
 * Represents a Teensy Buzzer
 */
class Buzzer {
	/** @var device The HID device */
	device/*: HID.HID*/ = null;

	/** @var eventListeners The registered event listeners */
	eventListeners/*: {
		'ready': Array<Function>,
		'leave': Array<Function>,
		'press': Array<Function>
	}*/ = {
			'ready': [],
			'leave': [],
			'press': []
		};

	/** @var handlers The press event listeners */
	handlers/*: Array<Array<Function>>*/ = [];

	/** @var buzzersCount the number of buzzers */
	buzzersCount/*: number*/ = 4;

	connected/*: boolean*/ = false;

	/**
	 * @internal
	 *
	 */
	constructor() {
	}

	/**
	 * Connect the the buzzer
	 * @param {*} timeout the time (in milliseconds) after which the connection will be rejected.
	 * If timeout = 0, it will be never rejected
	 * @returns A promise.
	 */
	connect(timeout/*: number*/ = 0)/*: Promise<boolean>*/ {
		const startTime = new Date().getTime();
		return new Promise((resolve, reject) => {
			const interval = setInterval(() => {
				const time = new Date().getTime();
				if (timeout > 0 && time - startTime > timeout) {
					clearInterval(interval);
					reject(false);
					return;
				}

				const devices = HID.devices();
				const deviceInfo = devices.find(function (d) {
					return d.vendorId === 0x16C0
						&& d.productId === 0x0486
					//&& d.usagePage === 0xFFAB
					//&& d.usage === 0x200;
				});

				if (deviceInfo) {
					try {
						this.device = new HID.HID(deviceInfo.path);
						clearInterval(interval);
						//this.device.setNonBlocking(true);
						this.init();
						resolve(true);
					}
					catch(e) {

					}
				}

			}, 100);
		});
	}

	isReady()/*: boolean*/ {
		return this.device !== null;
	}

	init() {
		this.connected = true;
		this.device.on("data", (signal) => {
			var controllerIndex = signal[0];
			callHandlers(this.handlers['c' + controllerIndex], controllerIndex, 0);
			callHandlers(this.handlers['all'], controllerIndex, 0);
			this.eventListeners['press'].forEach(f => f(controllerIndex, 0));
		});

		this.device.on("error", () => {
			this.connected = false;
			this.leave();
		});

		this.device.on("close", () => {
			this.connected = false;
			this.device = null;
			this.eventListeners.leave.forEach(f => f());
		})
		this.eventListeners.ready.forEach(f => f());
	}

	/**
	 * Attaches an listener to an event.
	 * @param event the event
	 * @param callback the listener to attach
	 */
	addEventListener(event/*: string*/, callback/*: Function*/)/*: void*/ {
		this.eventListeners[event].push(callback);
		if (event == 'ready' && this.device) {
			callback();
		}
	}

	/**
	 * Removes an attached event listener
	 * @param event the event
	 * @param callback the listener to remove
	 */
	removeEventListener(event/*: string*/, callback/*: Function*/)/*: void*/ {
		const index = this.eventListeners[event].indexOf(callback);
		this.eventListeners[event].splice(index, 1);
	}

	/**
	 * Turn the lights off and close the connection
	 */
	leave() {
		console.log('leave buzzer');
		if (this.connected) {
			for (let i = 0; i < this.buzzersCount; i++) {
				this.light(i, false);
			}
			this.device.close();
		} else {
			// If device is disconnected, error event is fired,
			// but the close event is not fire, so cloe manually
			this.connected = false;
			this.device = null;
			this.eventListeners.leave.forEach(f => f());
		}
	}

	/**
	 * Turns on or on one or more controllers
	 * @param controllerIndexes the index
	 * @param value
	 */
	light(controllerIndexes/*: number | number[]*/, value) {
		let indexes = [];
		if (typeof (controllerIndexes) == 'number') {
			indexes = [controllerIndexes];
		} else {
			indexes = controllerIndexes
		}

		for (let i = 0; i < indexes.length; i++) {
			var message = [];
			for (var j = 0; j <= 64; j++) {
				message[j] = 0x00;
			}
			message[0] = 1;
			message[1] = indexes[i];
			message[2] = value ? 1 : 0;

			this.device.write(message);
		}
	}

	/**
	 * Turns the lights on (for one or more controllers)
	 * @param controllerIndexes the controller index or indexes
	 */
	lightOn(controllerIndexes/*: number | number[]*/)/*: void*/ {
		this.light(controllerIndexes, 0xFF);
	}

	/**
	 * Turns the lights off (for one or more controllers)
	 * @param controllerIndexes
	 */
	lightOff(controllerIndexes/*: number | number[]*/)/*: void*/ {
		this.light(controllerIndexes, 0x00);
	}

	/**
	 * Makes one or more controller blinking
	 * @param controllerIndexes  the controller index or indexes
	 * @param times the number of on/off cycles
	 * @param duration the duration of each on/off
	 * @param lightOnAtEnd (default: true) is the light on at the end of the blining
	 */
	blink(controllerIndexes/*: number | number[]*/, times = 5, duration = 150, lightOnAtEnd = true)/*: Promise<void>*/ {
		return new Promise((resolve, reject) => {
			let on = true;
			let count = 1;
			let totalTimes = times * 2 - (lightOnAtEnd ? 1 : 0);
			const _update = () => {

				if (count > totalTimes) {
					clearInterval(interval);
					resolve();
					return;
				}

				if (on) {
					this.lightOn(controllerIndexes);
				} else {
					this.lightOff(controllerIndexes);
				}

				count++;
				on = !on;
			}

			_update();
			let interval = setInterval(_update, duration);
		});
	}

	/**
	 * Press event listener
	 * @param callback the event listener
	 * @param controllerIndex the index of the controller if listening for a specific controller
	 * @param buttonIndex the button index if listening for a specific button
	 * @returns the function to remove the listener
	 */
	onPress(callback/*: Function*/, controllerIndex/*: number*/, buttonIndex/*: number*/)/*: Function*/ {
		var key = 'all';
		if (controllerIndex != undefined || buttonIndex != undefined) {
			key = '';
			if (controllerIndex != undefined) {
				key = 'c' + controllerIndex;
			}
			if (buttonIndex != undefined) {
				key += 'b' + buttonIndex
			}
		}

		if (!(key in this.handlers)) {
			this.handlers[key] = [];
		}
		this.handlers[key].push(callback);
		return () => {
			var index = this.handlers[key].indexOf(callback);
			if (index >= 0) {
				this.handlers[key].splice(index, 1);
			}
		};
	}

	/**
	 * Gets the number of controllers
	 * @returns the number of controllers
	 */
	controllersCount()/*: number*/ {
		return this.buzzersCount;
	}
}

exports.Buzzer = Buzzer;