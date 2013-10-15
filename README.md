# NodeCloudPT -- NodeJS SDK for the CloudPT service

## NodeCloudPT

NodeCloudPT is a NodeJS SDK for the CoudPT service that covers all the API methods and parameters. You can see all the API  documentation [here](https://cloudpt.pt/documentation). 

Also has an experimental function that imports directly a file from a URL.

## Basic Examples

### Create an instance

```javascript
var cloudpt = new NodeCloudPT({
	oauth : {
		consumer_key : "your consumer key",
		consumer_secret : "your consumer secret",
		token : "your access token",
		token_secret : "your access token secret"
	}
});
```
### Account Info
```javascript
cloudpt.accountInfo(function(data) {
	console.log(data);
});
```

### Metadata
```javascript
cloudpt.metadata({path:"/test", list:true}, function(data) {
	console.log(data);
});
```

### List
```javascript
cloudpt.list({path:"/metal",max_rows:1}, function(data) {
	console.log(data);
});
```

### Create Folder
```javascript
cloudpt.createFolder({path: "/mikeal"}, function(data) {
	console.log(data);
});
```

### Delta
```javascript
cloudpt.delta(function(data) {
	console.log(data);
});
```
### Copy
```javascript
cloudpt.copy({from_path:"heavy/world.js", to_path:"soft/world-copy.js"}, function(data) {
	console.log(data);
});
```

See more examples on tests folder

## Uploading and downloading files

### Upload
You have to describe the `path` on the server to place the `file` on your filesystem.

```javascript
cloudpt.upload({path:"music/sigur.mp3", file:"sigur.mp3"}, function(data) {
	console.log(data);
});
```

### Download
You have to describe the `path` on the server where to get the content. You can indicate a `file` on your filesystem to save the result our get it on the callback function.

```javascript
// get content on data variable
cloudpt.download({path:"/style/gangnam.png"}, function(data) {
	console.log(data);
});
// save content to a file
cloudpt.download({path:"/style/gangnam.png", file:"gangnam-file.png"}, function(data) {
	console.log(data);
});
```

### Import directly from URL
You can import a file directly from a URL by describing the `url`where to find the file and the `path` where to store it.

```javascript
// get content on data variable
cloudpt.importFromURL({path:"/specialone/main.pdf",url:"http://some.url.com/somefile.pdf"}, function(data) {
	console.log(data);
});
```
## TODO
* Functions to get the oAuth tokens
* Import directly from other storage services
