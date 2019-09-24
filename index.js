const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const KEYS = require('./configuration/keys');
const nunjucks = require('nunjucks');
const fileUpload = require('express-fileupload');

// init app
let app = express()
const port = 3000 || process.env.PORT
app.listen(port, () => console.log(`server is running on ${port}`))

// init view
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
app.get('/', function (req, res) {
    res.render('index', { user: req.user });
  });
  
  app.get('auth/login', function (req, res) {
  
    if (req.user) res.redirect('/') // if auth
    else res.redirect('/auth/login/google') // if not auth
  
  })
  
  // login redirect
  app.get('auth/login/google', passport.authenticate("google", {
    scope: ['profile', "https://www.googleapis.com/auth/drive.file", "email"]
  }))
  
  // logout
  app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/')
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
        // success
        if (data.status == 200) {
          alert("Sent mail");
        }
        // unsuccess
        else {
          alert("Sending failed");
        }
  
      }).catch(err => { throw new Error(err) })
    }
  })
