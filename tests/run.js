var NodeCloudPT = require("../NodeCloudPT.js");

var key = "your-key-here";
var secret = "your-secret-here";

// Obtidos atraves do getCodes.js
var access_token = "your-access-token-here";
var token_secret = "yout-token-secret-here";

var callback = function(data) {
	console.log(data);
}
var empty = function(value) {
	return (value === "" || value === null || typeof value === "undefined");
}
var storage = NodeCloudPT({
	oauth : {
		consumer_key : key,
		consumer_secret : secret,
		token : access_token,
		token_secret : token_secret
	}

});

var rand = (parseInt(Math.random() * 1000));
var dir = "/STORAGE_TEST" + rand;
var file = "file.json";

var start = function() {
	var name = "Account Info";
	console.log(name);
	storage.accountInfo(function(data) {
		if (empty(JSON.parse(data)["email"])) {
			throw new Error(name + " Failed " + data);
		}
		createFolder();
	});
}


var createFolder = function() {
	var name = "Create Folder";
	console.log(name);
	storage.createFolder({
		path : dir
	}, function(data) {
		if (empty(JSON.parse(data)["hash"])) {
			throw new Error(name + " Failed " + data);
		}
		metaData();

	});
}
var metaData = function() {
	var name = "Metadata";
	console.log(name);
	storage.metadata({
		path : dir
	}, function(data) {
		//console.log(data);
		if (empty(JSON.parse(data)["hash"])) {
			throw new Error(name + " Failed " + data);
		}
		upload();

	});
}
var upload = function() {
	var name = "Upload";
	console.log(name);
	storage.upload({
		path : dir + "/" + file,
		file : file
	}, function(data) {
		//console.log(data);
		if (empty(JSON.parse(data)["rev"])) {
			throw new Error(name + " Failed " + data);
		}
		download();

	});
}
var download = function() {
	var name = "Download";
	console.log(name);
	storage.download({
		path : dir + "/" + file
	}, function(data) {
		if (empty(JSON.parse(data)["name"])) {
			throw new Error(name + " Failed " + data);
		}
		share();

	});
}
var share = function() {
	var name = "Sharing";
	console.log(name);
	storage.shares({
		path : dir + "/" + file
	}, function(data) {
		//console.log(data);
		if (empty(JSON.parse(data)["url"])) {
			throw new Error(name + " Failed " + data);
		}
		removeFolder();

	});
}
var importFromURL = function(url) {
	var name = "Importing from " + url;
	console.log(name);
	storage.shares({
		path : dir + "/" + rand + file,
		url : url
	}, function(data) {
		console.log(data);
		if (empty(JSON.parse(data)["url"])) {
			throw new Error(name + " Failed " + data);
		}

		removeFolder();

	});
}
var removeFolder = function() {
	var name = "Remove Folder";
	console.log(name);
	storage.remove({
		path : dir
	}, function(data) {
		if (empty(JSON.parse(data)["hash"])) {
			throw new Error(name + " Failed " + data);
		}
		end();

	});
}
var end = function() {
	console.log("ALL OK!")
}

start();
