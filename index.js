const express = require('express');
const passportConfig = require('./configs/passport');
const passport = require('passport');
const cookieSession = require('cookie-session');
const KEYS = require('./configs/keys');
const nunjucks = require('nunjucks');
const fileUpload = require('express-fileupload');
const { google } = require('googleapis');

// init app
let app = express();
const port = 3000;
app.listen(port, () => console.log(`server is running on 3000`));

// init view
app.use(express.static(__dirname + '/public'));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});


// init session
app.use(cookieSession({
    keys: [KEYS.session_key]
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// file upload
app.use(fileUpload());;

// init routes
app.get('/auth/login', function (req, res) {

    if (req.user) {
        res.redirect('/dashboard');
    }
    else {
        res.redirect('/auth/login/google');
    }

})

// login redirect
app.get('/auth/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "email"]
}))

// callback from google oauth (with token)
app.get('/auth/google/redirect', passport.authenticate('google'), function (req, res) {

    res.redirect('/dashboard');
})

// logout
app.get('/auth/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
})

app.get('/', function (req, res) {
    res.render('home.html');
})

app.get('/dashboard', function (req, res) {

    // if not user
    if (typeof req.user == "undefined") {
        res.redirect('/auth/login/google');
    }
    else {

        let parseData = {
            title: 'DASHBOARD',
            googleid: req.user._id,
            name: req.user.name,
            avatar: req.user.pic_url,
            email: req.user.email
        }

        // if redirect with google drive response
        if (req.query.file !== undefined) {

            // successfully upload
            // if (req.query.file == "upload") {
            //     res.redirect('/dashboard');
            // }
            // else if (req.query.file == "notupload") {
            //     res.redirect('/dashboard');
            // }
        }

        res.render('dashboard.html');
    }
})

app.post('/upload', function (req, res) {

    // not auth
    if (!req.user) {
        res.redirect('/auth/login/google');
    }
    else {

        // config google drive with client token
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': req.user.accessToken
        });

        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        //move file to google drive

        let { name: filename, mimetype, data } = req.files.file_name

        const driveResponse = drive.files.create({
            requestBody: {
                name: filename,
                mimeType: mimetype
            },
            media: {
                mimeType: mimetype,
                body: Buffer.from(data).toString()
            }
        });

        driveResponse.then(data => {

            if (data.status == 200) {
                res.redirect('/dashboard?file=upload');
            }
            else {
                res.redirect('/dashboard?file=notupload');
            }

        }).catch(err => { throw new Error(err) })
    }
})