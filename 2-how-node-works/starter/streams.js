const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
    //Solution1
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) console.log(err);
    //     res.end(data);
    // });


    //Solutin2 : Streams
    // const readable = fs.createReadStream('test-file.txt');  //Raedable Stream
    // readable.on('data', chunk => {       //Every time there is a new peace of data that we can consume, the readable stream emits the data event so we listen to that event(on method)
    //     res.write(chunk);                //res is a Writable Stream
    // });
    // readable.on('end', () => {          //listening to the end event(there is no more data to consume)
    //     res.end();                      //the end method signals that no more data will be written to this writable stream(res)
    // });
    // readable.on('error', err => {       //listening to the error event
    //     console.log(err);               
    //     res.statusCode = 500;           // the status code is automatically set to 200(ok) but we have now a server error which means we have to send 500
    //     res.end('Page not found')
    // });
    //ther is a problem with this solution : thr readable stream is much faster than sending the result with the response writable stream over the network, this problrm is called : back pressure
    
    
    //Solution3 : using pipe, solution for the back pressure problem (best solution)
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);         //readableSource.pipe(writableDest)
});

server.listen(8000,'127.0.0.1',() => {
    console.log('Listening....');
});