#!/usr/bin/node

with(require('./pokerstars.js').parser) {

	require('fs').readFile(process.argv[2], "utf-8", function(err, data){
		if(err){
			console.error('Error reading file ' + process.argv[2]);
			console.error(err);

			process.exit(1);
		}

		try{
			console.log(JSON.stringify(parse(data))); // , null, 3
		} catch(e){
			console.error('Error processing file ' + process.argv[2]);
			console.error(e);

			process.exit(2);
		}
		
	});

}
