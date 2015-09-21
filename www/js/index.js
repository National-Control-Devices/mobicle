/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function popup() {
	var $ = jQuery;
	$.post("https://api.particle.io/oauth/token", {
		client_id : 'particle',
		client_secret : 'particle',
		grant_type : 'password',
		username : 'travis@controlanything.com',
		password : 'Spunky11'
	}, function() {
		console.log("Post request sent");
	}).success(function(data) {
		console.log(data);
		var output = '';
		output += '<li>' + "Success" + '</li>';
		$('#deviceList').append(output).listview('refresh');
	}).error(function(data) {
		console.log("POST request error");
	});
}

(function($) {
	$(document).ready(function() {
		//Send Post request to Particle server to obtain an access token on the user's behalf.
		$.post("https://api.particle.io/oauth/token", {
			client_id : 'particle',
			client_secret : 'particle',
			grant_type : 'password',
			username : 'travis@controlanything.com',
			password : 'Spunky11'
		}, function() {
			console.log("Post request sent");
		}).success(function(data) {
			//Got access token for accessing user info on Particle server
			$('#statusLabel').text("Getting Device List");
			accessToken = data.access_token;
			var requestURL = 'https://api.particle.io/v1/devices?access_token=' + accessToken;
			//Send get request to get a list of user's devices
			$.get(requestURL, function() {
			}).done(function(devices) {
				$('#statusLabel').text("Device List Loaded");
				//For Each loop to load each device's information
				$.each(devices, function() {
					var device = this;
					var name = device.name == null ? "Unnamed Device" : device.name;
					var li = $("<li></li>");
					//Add device to list view
					li.text(name).appendTo("#deviceList").attr("id", device.id);
					if (device.connected == true) {
						li.addClass("connected").click(function() {
							$('#listOfDevices').css({
								display : "none"
							});
							$('#deviceView').css({
								display : "block"
							});
							$('#deviceNameHeader').text(device.name);
							var deviceInfoURL = "https://api.particle.io/v1/devices/" + device.id + "?access_token=" + accessToken;
							$.get(deviceInfoURL, function() {

							}).done(function(deviceInfo) {
								console.log(deviceInfo);
								$.each(deviceInfo.functions, function() {
									var deviceFunction = this;
									var functionLI = $("<li></li>");
									functionLI.text(deviceFunction).appendTo('#deviceFunctionList').click(function() {
										var userInput = prompt("Enter function Argument");
										if (userInput) {
											var functionURL = "https://api.particle.io/v1/devices/" + device.id + "/" + deviceFunction;
											$.post(functionURL, {
												arg : userInput,
												access_token : accessToken
											}, function() {

											}).success(function(data) {
												console.log(data);
											});
										}
									});
								});
								var deviceVariables = deviceInfo.variables;
								console.log(deviceVariables);
								for (var key in deviceVariables) {
									console.log(key);
									var variableLI = $('<li></li>');
									variableLI.appendTo('#deviceVariablesList').attr("id", device.id + key);
									var variableRequestURL = "https://api.particle.io/v1/devices/" + device.id + "/" + key + "?access_token=" + accessToken;
									$.get(variableRequestURL, function(deviceVar) {
										var varText = deviceVar.name + ": " + deviceVar.result;
										$("li#" + device.id + deviceVar.name).text(varText);
										console.log(varText);
									});
									window.setInterval(function(){
										reloadDeviceVariables(variableRequestURL);
									},2000);
								}
							}).fail(function() {
								console.log("Failed to load device info");
							});
						});
					} else {
						//Device not connected so we really dont need to do anything but display it to the user.
					}

				});

				window.setInterval(function() {
					reloadDevices(requestURL);
				}, 2000);
				console.log(devices);
			}).fail(function() {
				$('#statusLabel').text("Error loading Device List");
			});
			$.get(requestURL, function(data) {

			});

		}).error(function(data) {
			console.log("POST request error");
			$('#statusLabel').text("Error Connecting to Server");
		});
	});

	function reloadDeviceVariables(url) {
		var args = url.split("/");
		var deviceID = args[5];
		console.log("Device ID: "+deviceID);
		$.get(url, function(deviceVar) {
			var varText = deviceVar.name + ": " + deviceVar.result;
			$("li#" + deviceID + deviceVar.name).text(varText);
			console.log(varText);
		});
	}

	function reloadDevices(url) {
		$.get(url, function() {
		}).done(function(devices) {
			$('#statusLabel').text("Device List Loaded");
			//For Each loop to load each device's information
			$.each(devices, function() {
				var device = this;
				if (device.connected == true) {
					$('#' + device.id).addClass('connected');
				} else {
					//Device not connected so we really dont need to do anything but display it to the user.
					$('#' + device.id).removeClass('connected');
				}

			});
		}).fail(function() {
			$('#statusLabel').text("Error loading Device List");
		});
		$.get(url, function(data) {

		});
	}

})(jQuery);

var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		app.receivedEvent('deviceready');
		(function($) {

		})(jQuery);
	},
	// Update DOM on a Received Event
	receivedEvent : function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	}
};

(function($) {
	$(document).on("mobileinit", function() {
		console.log("jQuery Mobile init");
	});
})(jQuery);
