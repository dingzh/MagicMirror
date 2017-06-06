/* Magic Mirror
 * Node Helper: Calendar
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var validUrl = require("valid-url");
var CalendarFetcher = require("./calendarfetcher.js");
var rpio = require('rpio');
var NodeWebcam = require( "node-webcam" );
var request = require("request");
var fs = require("fs");

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var events = [];
		this.fetchers = [];
		
		var opts = {
		    width: 1280,
		    height: 720,
		    quality: 100,
		    delay: 0,
		    //Save shots in memory 
		    saveShots: true,
		    output: "jpeg",
	
		    //false for default device 
		    device: false,
 
		    // [location, buffer, base64] 
		    // Webcam.CallbackReturnTypes 
		    callbackReturn: "buffer",
			// callbackReturn: "location",
		    //Logging 
		    verbose: true
		};
		this.webcam = NodeWebcam.create(opts);
		
		rpio.open(12, rpio.INPUT);
		this.poll();
		
		// this.takeShot();
		console.log("Starting node helper for: " + this.name);

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "ADD_CALENDAR") {
			console.log('ADD_CALENDAR: ');
			this.createFetcher(payload.url, payload.fetchInterval, payload.maximumEntries, payload.maximumNumberOfDays, payload.auth);
		}
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exist yet.
	 * Otherwise it reuses the existing one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function(url, fetchInterval, maximumEntries, maximumNumberOfDays, auth) {
		var self = this;
		// console.log(self);

		if (!validUrl.isUri(url)) {
			self.sendSocketNotification("INCORRECT_URL", {url: url});
			return;
		}

		var fetcher;
		if (typeof self.fetchers[url] === "undefined") {
			console.log("Create new calendar fetcher for url: " + url + " - Interval: " + fetchInterval);
			fetcher = new CalendarFetcher(url, fetchInterval, maximumEntries, maximumNumberOfDays, auth);

			fetcher.onReceive(function(fetcher) {
				//console.log('Broadcast events.');
				//console.log(fetcher.events());

				self.sendSocketNotification("CALENDAR_EVENTS", {
					url: fetcher.url(),
					events: fetcher.events()
				});
			});

			fetcher.onError(function(fetcher, error) {
				self.sendSocketNotification("FETCH_ERROR", {
					url: fetcher.url(),
					error: error
				});
			});

			self.fetchers[url] = fetcher;
		} else {
			//console.log('Use existing news fetcher for url: ' + url);
			fetcher = self.fetchers[url];
			fetcher.broadcastEvents();
		}

		fetcher.startFetch();
	},
	
	
	poll: function() {
		var self = this;
		this.last_ir_state = 1;
		var curr = rpio.read(12);
		var timeout = 300;
		if (this.last_ir_state == 1 && curr == 0) {
			console.log("motion detected");
			timeout = 5000;
			// this.webcam.capture("faceshot", this.camCallback);
			this.webcam.capture("faceshot", function(err, data){
	  				self.sendSocketNotification("CHANGE_URL", {id: 'usa'});
					console.log("result:usa");
					
					var detect_options = {
					  url:"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false",
					  headers:{
					    'Content-Type': 'application/octet-stream',
					    'Host': 'westcentralus.api.cognitive.microsoft.com',
					    'Ocp-Apim-Subscription-Key': 'e581926e312f49a7b3c02eea3c98d918'
					  },
					  body: data,  
					//body: fs.createReadStream(path),
					  method: 'POST'
					};
		
					if (!err) {
						request(detect_options, function(error, response, body) {
					  	  console.log('error:', error);
					  	  console.log('statuscode:', response&&response.statusCode);
					  	  console.log('body:', body);
					  	  var json_data = JSON.parse(body);
					  	  if (json_data.length >= 0) id = json_data[0].faceId;
					  	  console.log("faceid:"+json_data[0].faceId);
 
					  	  var identify_body = "{'confidenceThreshold':0.1,'maxNumOfCandidatesReturned':1,'faceIds':['" + id + "'],'personGroupId':'1'}";
					  	  var identify_options = {
					  			url:"https://westcentralus.api.cognitive.microsoft.com/face/v1.0/identify",
					  			headers:{
					  				'Content-Type': 'application/json',
					  				'Host': 'westcentralus.api.cognitive.microsoft.com',
					  				'Ocp-Apim-Subscription-Key': 'e581926e312f49a7b3c02eea3c98d918'
					  			},
					  			body: identify_body,
					  			method: 'POST'
					  		};

					  		var FaceId2Name = {
					  			"a4b9f1d1-699c-4f8e-a964-611169c39503":"zhouding",
					  			"791b03f0-f626-4ff8-bd07-7fd671415765":"dengyini",
					  			"37878c47-8558-489d-b4e8-33ee3bac3f93":"wupeilin",
					  		};
	  
					  		request(identify_options,  function (error1, response1, body1) {
					  			console.log('error:', error1);
					  			console.log('statuscode:', response1&&response1.statusCode);
					  			console.log('body:', body1);
					  			var res = JSON.parse(body1);
					  			if (res.length > 0 && res[0].candidates.length > 0) {
					  				var finalFaceId = res[0].candidates[0].personId;
					  				//send info out
					  				self.sendSocketNotification("CHANGE_URL", {id: FaceId2Name[finalFaceId]});
									console.log("result:"+finalFaceId + " Name: " + FaceId2Name[""+finalFaceId]);
					  			} else {
					  				self.sendSocketNotification("CHANGE_URL", {id: 'usa'});
									console.log("result:usa");
					  			}

					  		});
						});
				console.log("send face");
			} else {
				console.log(err);
			}
			});
			console.log("pics taken");
		} 
		this.last_ir_state = curr;
		setTimeout(function() {self.poll();}, timeout);
	},
});
