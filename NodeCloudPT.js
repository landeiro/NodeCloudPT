//
// Copyright (c) Pedro Landeiro <landeiro@gmail.com>, All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var default_service = {
	api : {
		root : "meocloud",
		storage : "/1",
		endpoint : "https://publicapi.meocloud.pt",
		content_endpoint : "https://api-content.meocloud.pt"
	},
	oauth : {
		request_token_endpoint : "https://meocloud.pt/oauth/request_token",
		access_token_endpoint : "https://meocloud.pt/oauth/access_token"
	}
}
var request = require('request');

var querystring = require('querystring');
var fs = require("fs");


function NodeCloudPT(config) {
	
	if (!(this instanceof NodeCloudPT)) {
		return new NodeCloudPT(config);
	}

	config.api = config.api || {};
	var storage_root = config.api.root || default_service.api.root;
	var request_token_endpoint = config.oauth.request_token_endpoint || default_service.oauth.request_token_endpoint;
	var access_token_endpoint = config.oauth.access_token_endpoint || default_service.oauth.access_token_endpoint;
	var api_endpoint = config.api.endpoint || default_service.api.endpoint;
	var api_content_endpoint = config.api.content_endpoint || default_service.api.content_endpoint;
	var storage = config.api.storage || default_service.api.storage;
	var oauth = config.oauth;

	var makeRequest = function(args) {
		//console.log(args);
		args.params = args.params || {};
		var callback = args.callback;
		var file = args.params.file || "";
		delete args.params.file;
		var url = args.params.url || "";
		delete args.params.url;

		if (storage_root === "dropbox") {
			args.endpoint = args.endpoint.toLowerCase();
		}

		var options = {
			oauth : oauth,
			method : args.request_method,
			uri : args.endpoint,
			timeout : 0
		};

		var qstring = querystring.stringify(args.params);

		// first check for file operations
		if (args.file_operation === "upload") {
			options.uri += (qstring !== "") ? ["?", qstring].join("") : qstring;
			//console.log(options);
			fs.stat(file, function(error, stat) {
				if (error) {
					throw error;
				}
				options.headers = options.headers || {};
				options.headers['content-length'] = stat.size;
				fs.createReadStream(file).pipe(request(options, function(error, response, body) {
					callback(body);
				}));
			});
		} else if (args.file_operation === "download") {
			options.uri += (qstring !== "") ? ["?", qstring].join("") : qstring;
			if (file !== "") {// download to file
				request(options).pipe(fs.createWriteStream(file));
			} else {
				request(options, function(error, response, body) {
					//console.log(response);
					callback(body);
				});
			}
		} else if (args.file_operation === "importFromURL") {
			options.uri += (qstring !== "") ? ["?", qstring].join("") : qstring;
			//console.log(options);
			request.get(url).pipe(request(options, function(error, response, body) {
				console.log(error);
				callback(body);
			}));
		}  else {// just metadata
			(options.method === "get") ? options.uri += ((qstring !== "") ? ["?", qstring].join("") : qstring) : options.body = qstring;
			//options.qs = args.params;
			//console.log(options);
			request(options, function(error, response, body) {
				//console.log(response);
				callback(body);
			});
		}

	}
	// OK
	var metadata = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/Metadata/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var metadataShare = function(args, callback) {
		var path = args.path;
		var shareid = args.shareid;
		delete args.path;
		delete args.shareid;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/MetadataShare/", shareid, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var listLinks = function(callback) {
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/ListLinks"].join(""),
			callback : callback
		});
	}
	// OK
	var deleteLink = function(args, callback) {
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/DeleteLink"].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var shares = function(args, callback) {

		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Shares/", storage_root, args.path].join(""),
			callback : callback
		});
	}
	// OK
	var shareFolder = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/ShareFolder/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var listSharedFolders = function(callback) {

		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/ListSharedFolders"].join(""),
			callback : callback
		});
	}
	// OK
	var list = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/List/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var thumbnails = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_content_endpoint, storage, "/Thumbnails/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var search = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/Search/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var revisions = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/Revisions/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var restore = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Restore/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var media = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Media/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var download = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_content_endpoint, storage, "/Files/", storage_root, path].join(""),
			params : args,
			file_operation : "download",
			callback : callback
		});
	}
	// OK
	var upload = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "post",
			endpoint : [api_content_endpoint, storage, "/Files/", storage_root, path].join(""),
			params : args,
			file_operation : "upload",
			callback : callback
		});
	}
	// OK
	var delta = function(args, callback) {
		if ( typeof args !== "object") {
			callback = args;
		}
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Delta"].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var copy = function(args, callback) {

		args.root = args.root || storage_root;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Fileops/Copy"].join(""),
			params : args,
			callback : callback
		});
	}
	// not tested
	var copyRef = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/CopyRef/", storage_root, path].join(""),
			callback : callback
		});
	}
	// OK
	var remove = function(args, callback) {
		args.root = args.root || storage_root;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Fileops/Delete"].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var move = function(args, callback) {
		args.root = args.root || storage_root;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Fileops/Move"].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var createFolder = function(args, callback) {
		args.root = args.root || storage_root;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/Fileops/CreateFolder"].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var undeleteTree = function(args, callback) {
		args.root = args.root || storage_root;
		makeRequest({
			request_method : "post",
			endpoint : [api_endpoint, storage, "/UndeleteTree/", storage_root, args.path].join(""),
			params : args,
			callback : callback
		});
	}
	// OK
	var accountInfo = function(callback) {
		makeRequest({
			request_method : "get",
			endpoint : [api_endpoint, storage, "/Account/Info"].join(""),
			callback : callback
		});
	}
	var importFromURL = function(args, callback) {
		var path = args.path;
		delete args.path;
		makeRequest({
			file_operation : "importFromURL",
			request_method : "put",
			endpoint : [api_content_endpoint, storage, "/Files/", storage_root, path].join(""),
			params : args,
			callback : callback
		});
	}
	return {
		accountInfo : accountInfo,
		delta : delta,
		createFolder : createFolder,
		media : media,
		metadata : metadata,
		metadataShare : metadataShare,
		listLinks : listLinks,
		deleteLink : deleteLink,
		shares : shares,
		shareFolder : shareFolder,
		listSharedFolders : listSharedFolders,
		list : list,
		thumbnails : thumbnails,
		search : search,
		revisions : revisions,
		restore : restore,
		copy : copy,
		copyRef : copyRef,
		remove : remove,
		move : move,
		createFolder : createFolder,
		undeleteTree : undeleteTree,
		download : download,
		upload : upload,
		importFromURL : importFromURL
	}
}

module.exports = NodeCloudPT
