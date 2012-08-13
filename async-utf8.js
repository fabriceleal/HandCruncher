#!/usr/bin/node

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;


var AsyncUtf8 = function(file){
	this.file = file;
	this.fd = 0;
	this.open = false;
	this.buf = {
		length : 1024,
		buffer : new Buffer(1024)
	};

	return this;
};

AsyncUtf8.prototype = new EventEmitter();
AsyncUtf8.prototype.constructor = AsyncUtf8;

AsyncUtf8.prototype.read = function(length, callback){
	var _this = this;
	if(!_this.open){
		fs.open(_this.file, 'r', function(err, fd){
				//console.log('open');
				_this.open = true;
				_this.fd = fd;

				_this.read(length, callback);

		}); // fs.open
		return;
	}
	//console.log('read(' + length +')');

	var readFileCallback = function(err, bytes, buffer){
		if(err) throw err;

		//console.log('callback');

		buffer.info.length += bytes;

		if(bytes === 0){
			// End of file ...
			fs.close(_this.fd, function(err){
				if(err) throw err;
				_this.open = false;
			});
			return;
		}

		var ch, i = buffer.info.lastValid;

		// Validate the buffer 
		for( ; i < buffer.info.length; ){
			ch = buffer[i];
			if(ch === 0xFD || ch === 0xFC){
				i += 6;
				//process.stdout.write('|');
			} else if (ch >= 0xF8 && ch <= 0xFB){
				i += 5;
				//process.stdout.write('*');
			} else if (ch >= 0xF0 && ch <= 0xF7){
				i += 4;
				//process.stdout.write('+');
			} else if (ch >= 0xE0 && ch <= 0xEF){
				i += 3;
				//process.stdout.write(';');
			} else if (ch >= 0xC0 && ch <= 0xDF){
				i += 2;
				//process.stdout.write(':');
			} else {
				// This is not a utf8 validator. Everything else is a valid 1-byte-long char!!!
				++i;
				//process.stdout.write('.');
			}
		}

		//process.stdout.write('\n');
		//console.log('Uncomplete chars: ' + (i - buffer.info.length));
		//console.log('Buffer: ' + buffer.toString('utf8', 0, buffer.info.length));

		if (i > buffer.info.length){
			// Fix last valid index
			buffer.info.lastValid = Math.min(i, buffer.info.length);

			// Read to fix the current chunk
			fs.read(_this.fd, buffer, buffer.info.length, i - buffer.info.length, null, readFileCallback);
		} 
		else 
		{
			// This is a correct utf8 buffer. emit it!
			var str = buffer.toString('utf8', 0, buffer.info.length)
			//console.log('Buffer: ' + str);
			callback(str);
			// Ready for new chunk read
			//buffer.info = { lastValid: 0, length: 0};
			//fs.read(fd, buffer, 0, maxLength, null, readCallback);
		}
	}; // readFileCallback

	// Read new chunk
	_this.buf.buffer.info = { lastValid: 0, length: 0};

	//console.log('starting reading ' + _this.fd + '...');
	fs.read(_this.fd, _this.buf.buffer, 0, length, null, readFileCallback);

}; // AsyncUtf8.prototype.read


console.log(process.argv[2]);
var a = new AsyncUtf8(process.argv[2]);

var c = function(s){
	process.stdout.write(s);

	if(a.open) a.read(1, c);
}
a.read(1, c);




/*
// Open the file, only for reading
fs.open(process.argv[2], 'r', function(err, fd){
	if(err) throw err;
	console.log('open');

	var length = 256;
	var maxLength = 10;
	var buffer = new Buffer(length);

	var readCallback = function(err, bytes, buffer){
		if(err) throw err;

		buffer.info.length += bytes;

		if(bytes === 0){
			// End of file ...
			fs.close(fd);
			return;
		}

		var ch;
		var i = buffer.info.lastValid;

		// Validate the buffer 
		for( ; i < buffer.info.length; ){
			ch = buffer[i];
			if(ch === 0xFD || ch === 0xFC){
				i += 6;
				//process.stdout.write('|');
			} else if (ch >= 0xF8 && ch <= 0xFB){
				i += 5;
				//process.stdout.write('*');
			} else if (ch >= 0xF0 && ch <= 0xF7){
				i += 4;
				//process.stdout.write('+');
			} else if (ch >= 0xE0 && ch <= 0xEF){
				i += 3;
				//process.stdout.write(';');
			} else if (ch >= 0xC0 && ch <= 0xDF){
				i += 2;
				//process.stdout.write(':');
			} else {
				// This is not a utf8 validator. Everything else is a valid 1-byte-long char!!!
				++i;
				//process.stdout.write('.');
			}
		}

		//process.stdout.write('\n');
		//console.log('Uncomplete chars: ' + (i - buffer.info.length));
		//console.log('Buffer: ' + buffer.toString('utf8', 0, buffer.info.length));

		if (i > buffer.info.length){
			// Fix last valid index
			buffer.info.lastValid = Math.min(i, buffer.info.length);

			// Read to fix the current chunk
			fs.read(fd, buffer, buffer.info.length, i - buffer.info.length, null, readCallback);
		} 
		else 
		{
			// This is a correct utf8 buffer. emit it!

			console.log('Buffer: ' + buffer.toString('utf8', 0, buffer.info.length));

			// Ready for new chunk read
			//buffer.info = { lastValid: 0, length: 0};
			//fs.read(fd, buffer, 0, maxLength, null, readCallback);
		}

	};

	// Read new chunk
	buffer.info = { lastValid: 0, length: 0};
	fs.read(fd, buffer, 0, maxLength, null, readCallback);
});*/
