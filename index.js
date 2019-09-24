const express = require('express')
const homeRouter = require('./routes/home')
const authRouter = require('./routes/auth')
const passportConfig = require('./configs/passport')
const passport = require('passport')
const cookieSession = require('cookie-session')
const KEYS = require('./configs/keys')
const nunjucks = require('nunjucks')
const fileUpload = require('express-fileupload')
const google = require('googleapis')

// init app
let app = express()
const port = 3000 || process.env.PORT
app.listen(port, () => console.log(`server is running on ${port}`))

// init view
app.use(express.static(__dirname + '/public'));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// init static
app.use('/static', express.static('public'))


// init session
app.use(cookieSession({
    keys: [KEYS.session_key]
}))

// init passport
app.use(passport.initialize())
app.use(passport.session())

// file upload
app.use(fileUpload());

// init routes
app.get('/auth/login', function (req, res) {

    if (req.user) res.redirect('/dashboard') // if auth
    else res.redirect('/auth/login/google') // if not auth

})

// login redirect
app.get('/auth/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "email"]
}))

// callback from google oauth (with token)
app.get('/auth/google/redirect', passport.authenticate('google'), function (req, res) {

    res.redirect('/dashboard')
})

// logout
app.get('/auth/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
})

app.get('/', function (req, res) {
    res.render('home.html', { 'title': 'Application Home' })
})

app.get('/dashboard', function (req, res) {

    // if not user
    if (typeof req.user == "undefined") res.redirect('/auth/login/google')
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
            if (req.query.file == "upload") parseData.file = "uploaded"
            else if (req.query.file == "notupload") parseData.file = "notuploaded"
        }

        res.render('dashboard.html', parseData)
    }
})

app.post('/upload', function (req, res) {

    // not auth
    if (!req.user) res.redirect('/auth/login/google')
    else {
        // auth user

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

        let { name: filename, mimetype, data } = req.files.file_upload

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

            if (data.status == 200) res.redirect('/dashboard?file=upload') // success
            else res.redirect('/dashboard?file=notupload') // unsuccess

        }).catch(err => { throw new Error(err) })
    }
})