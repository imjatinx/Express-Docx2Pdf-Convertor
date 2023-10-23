// const express = require('express');
// const multer = require('multer');
// const path = require('path')
// const libre = require('libreoffice-convert')
// const fs = require('fs')

// const port = process.env.PORT || 3000;
// const app = express();

// app.set('view engine', 'ejs')
// app.use(express.urlencoded({ extended: false }))

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         return cb(null, './uploads');
//     },
//     filename: (req, file, cb) => {
//         return cb(null, `${Date.now()}-${file.originalname}`)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     var ext = path.extname(file.originalname);
//     if (ext !== '.docx' && ext !== 'doc') {
//         return cb('This extension is not supported!')
//     }
//     cb(null, true)
// }

// const uploadFile = multer({ storage: storage, fileFilter: fileFilter })
// var outputPath = ''

// app.get('/', (req, res) => {
//     res.render('home');
// })

// app.post('/', uploadFile.single('file'), (req, res) => {
//     if (req.file) {

//         const file = fs.readFileSync(req.file.path);
//         outputPath = Date.now() + req.file.originalname;

//         libre.convert(file, ".pdf", undefined, (err, done) => {
//             if (err) {
//                 fs.unlinkSync(req.file.path);
//                 fs.unlinkSync(outputPath);

//                 res.send('error in converting ==> ', err)
//             }

//             fs.writeFileSync(outputPath, done);

//             res.download(outputPath, err => {
//                 if (err) {
//                     fs.unlinkSync(req.file.path);
//                     fs.unlinkSync(outputPath);
//                     res.send('error in downloading file ==> ', err)
//                 }
//                 fs.unlinkSync(req.file.path);
//                 fs.unlinkSync(outputPath);
//             });
//         });

//     }

//     res.redirect('/')
// })


// app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

const express = require('express');
const multer = require('multer');
const path = require('path');
const libre = require('libreoffice-convert');
const fs = require('fs');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (ext !== '.docx' && ext !== '.doc') { // Added a dot before 'doc'
        return cb('This extension is not supported!');
    }
    cb(null, true);
};

const uploadFile = multer({ storage: storage, fileFilter: fileFilter });
var outputPath = '';

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/', uploadFile.single('file'), (req, res) => {
    if (req.file) {
        const file = fs.readFileSync(req.file.path);
        outputPath = Date.now() + req.file.originalname;

        libre.convert(file, ".pdf", undefined, (err, done) => {
            if (err) {
                cleanupAndRespond(res, req.file.path, outputPath, 'Error in converting: ' + err);
                return;
            }

            fs.writeFileSync(outputPath, done);
            res.setHeader('Content-Type', 'application/pdf');
            res.download(outputPath, (err) => {
                cleanupAndRespond(res, req.file.path, outputPath, 'Error in downloading file: ' + err);
            });
        });
    } else {
        res.redirect('/');
    }
});

function cleanupAndRespond(res, sourcePath, outputPath, errorMessage) {
    if (sourcePath) {
        fs.unlinkSync(sourcePath);
    }
    if (outputPath) {
        fs.unlinkSync(outputPath);
    }
    res.send(errorMessage);
}

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
