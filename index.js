/*
* https://nodejs.org/api/http2.html
* */

const fs = require('fs');
const path = require('path');
const http2 = require('http2');
const mime = require('mime-types');
const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_METHOD,
    HTTP_STATUS_NOT_FOUND,
    NGHTTP2_REFUSED_STREAM,
    HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants;

const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
    ca: fs.readFileSync('./cacert.crt'),
    allowHTTP1: true,
};

const server = http2.createSecureServer(options);

const serverRoot = "./";
const pushAsset = (stream, file) => {
    const filePath = path.resolve(path.join(serverRoot, file.filePath));

    stream.pushStream({ [HTTP2_HEADER_PATH]: file.path }, { parent: stream.id }, (err, pushStream) => {
        if (!err) {
            console.log(">> Pushing:", file.path);

            pushStream.on('error', err => respondToStreamError(err, pushStream));
            pushStream.respondWithFile(filePath, file.headers);
        }

        if (err) {
            console.log(">> Pushing error:", err);
        }
    });
};

function respondToStreamError(err, stream) {
    console.log('respondToStreamError', err);

    const isRefusedStream =
        err.code === 'ERR_HTTP2_STREAM_ERROR' && stream.rstCode === NGHTTP2_REFUSED_STREAM;

    if (isRefusedStream || !stream.closed) {
        return;
    }

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

const secondRender = async (stream, jsFile) => {
    // emulate a long rendering
    await new Promise(resolve => {
        setTimeout(resolve, 1000);
    });

    if (!stream.closed) {
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
    }
};

server.on('timeout', error => {
    console.log('On server timeout:', error);
});

server.on('stream', async (stream, headers) => {
    const fullPath = headers[HTTP2_HEADER_PATH];
    const method = headers[HTTP2_HEADER_METHOD];

    console.log('>> Path:', fullPath);
    console.log('>> Method:', method);

    if (fullPath === '/') {
        stream.respond({
            'content-type': 'text/html',
            ':status': 200
        });

        const cssFile = getFileDescription('style.css');
        const cssFile1 = getFileDescription('style1.css');
        const jsFile = getFileDescription('script.js');

        const jsFile1 = getFileDescription('script1.js');
        const jsFile2 = getFileDescription('script2.js');


        pushAsset(stream, cssFile);
        pushAsset(stream, cssFile1);

        // try to uncomment and made some quick of page refreshes - i'll get an error!
         pushAsset(stream, jsFile1);
        // pushAsset(stream, jsFile2);

        stream.write('' +
            '<html>\n' +
            '<head>\n' +

            '    <link rel="stylesheet" type="text/css"  href="/style.css">\n' +
            '    <link rel="stylesheet" type="text/css"  href="/style1.css">\n' +

            ''
        );

        try {
            // emulation of a long async rendering
            await secondRender(stream, jsFile);
        } catch(err) {
            console.log('Second render error:', err);
        }

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

server.listen(4430);