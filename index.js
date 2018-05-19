const fs = require('fs');
const path = require('path');
const http2 = require('http2');
const mime = require('mime-types');
const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_METHOD,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants;

const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
};

const server = http2.createSecureServer(options);

const serverRoot = "./";
const pushAsset = (stream, file) => {
    const filePath = path.resolve(path.join(serverRoot, file.filePath));

    stream.pushStream({ [HTTP2_HEADER_PATH]: file.path }, (err, pushStream) => {
        console.log(">> Pushing:", file.path);

        pushStream.respondWithFile(filePath, file.headers, {
            onError: (err) => {
                respondToStreamError(err, stream);
            }
        });
    });
};

function respondToStreamError(err, stream) {
    console.log('Error', err);

    if (err.code === 'ENOENT') {
        stream.respond({ ":status": HTTP_STATUS_NOT_FOUND });
    } else {
        stream.respond({ ":status": HTTP_STATUS_INTERNAL_SERVER_ERROR });
    }
    stream.end();
}

function getContentHeader(fileName) {
    const ext = fileName.split('.').pop();
    const mimeTypes = {
        css: 'text/css',
        js: 'application/javascript'
    };

    return {
        'content-type': mimeTypes[ext]
    }
}

function getFileDescription(file) {
    return {
        path: `/${file}`,
        filePath: `./${file}`,
        headers: getContentHeader(file),
    };
}

server.on('stream', (stream, headers) => {
    const fullPath = headers[HTTP2_HEADER_PATH];
    const method = headers[HTTP2_HEADER_METHOD];

    console.log('>> Method:', method);

    if (fullPath === '/') {
        stream.respond({
            'content-type': 'text/html',
            ':status': 200
        });

        const cssFile = getFileDescription('style.css');
        const jsFile = getFileDescription('script.js');

        pushAsset(stream, cssFile);

        stream.write('' +
            '<html>\n' +
            '<head>\n' +
            '    <link rel="stylesheet" type="text/css"  href="/style.css">\n' +
            '    <link rel="stylesheet" type="text/css"  href="/style1.css">\n'
        );

        setTimeout(function() {
            stream.write('' +
                '</head>\n' +
                '<body>\n' +
                '    <h1 class="myHelloClass">Hi, EmpireConf!</h1>\n' +
                '</body>\n' +
                '<script src="script.js"></script>' +
                '<html>'
            );
            stream.end();

            pushAsset(stream, jsFile);
        }, 500);

    } else {
        const responseMimeType = mime.lookup(fullPath);

        // handle static file for non pushed assets
        console.log('>> Ststic file:', fullPath);

        stream.respondWithFile(path.resolve(path.join(serverRoot, fullPath)), {
            'content-type': responseMimeType
        }, {
            onError: (err) => respondToStreamError(err, stream)
        });
    }

});

server.listen(443);