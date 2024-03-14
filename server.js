const express = require('express');
const multer = require('multer');
const path = require('path');
const libre = require('libreoffice-convert');
const fs = require('fs');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

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
    if (ext !== '.docx' && ext !== 'doc') {
        return cb('This extension is not supported!');
    }
    cb(null, true);
}

const uploadFile = multer({ storage: storage, fileFilter: fileFilter });
var outputFilename = '';

app.get('/', (req, res) => {
    return res.render('home');
})

app.post('/', uploadFile.single('file'), (req, res) => {
    if (req.file) {
        const file = fs.readFileSync(req.file.path);
        const filenameWithoutExt = req.file.originalname.match(/([^/\\]+)(?=\.\w+$)/)[0];
        outputFilename = Date.now() + `-${filenameWithoutExt}.pdf`;

        libre.convert(file, ".pdf", undefined, (err, done) => {
            if (err) {
                if (req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                // if (outputFilename) {
                //     fs.unlinkSync(outputFilename);
                // }

                return res.send('error in converting ==> ', err);
            }

            fs.writeFileSync(outputFilename, done);

            res.download(outputFilename, err => {
                if (err) {
                    if (req.file.path) {
                        fs.unlinkSync(req.file.path);
                    }
                    // if (outputFilename) {
                    //     fs.unlinkSync(outputFilename);
                    // }
                    return res.send('error in downloading file ==> ', err);
                }
                if (req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                // if (outputFilename) {
                //     fs.unlinkSync(outputFilename);
                // }
            });
        });
    }else{
        return res.send('Thinking of converting blank file 🤔')
    }
});


app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
