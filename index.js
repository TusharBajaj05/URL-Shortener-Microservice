require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


//Database connection
const uri =
  "mongodb+srv://tusharbajajtb:" +
  process.env.PW +
  "@demodb.2pjeker.mongodb.net/db1?retryWrites=true&w=majority&appName=DemoDB";
const mongoose = require("mongoose");
mongoose.connect(uri, { /*useNewUrlParser: true, useUnifiedTopology: true */});

let urlSchema = new mongoose.Schema({
  originalUrl: {type: String, requires: true},
  short: Number
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser')
let originalUrl
let short
app.post('/api/shorturl', bodyParser.urlencoded({extended: false}), (req, res) => {
  originalUrl = req.body['url']

  let regexUrl = new RegExp( /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi)
  if(!originalUrl.match(regexUrl)) {
    res.json({error: 'Invalid Url'})
    return
  }
  
  let flag = 1
  Url.findOne({})
    .sort({short: 'desc'})
    .then((result) => {
      if(result != undefined) {
        flag = result.short + 1
      }
        Url.findOneAndUpdate(
          {originalUrl: originalUrl},
          {originalUrl: originalUrl, short: flag},
          {new: true, upsert: true})
          .then((savedUrl) => {
            short = savedUrl.short
            res.json({original_url: originalUrl, 'short_url': short})
          })
          .catch(err => {
            console.log(err)
          })   
      })
    .catch(err => {
      console.log(err)
    })
})

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input
  Url.findOne({short: input})
    .then(result => {
      if(result != undefined) {
        res.redirect(result.originalUrl)
      }
      else {
        res.json('URL not found')
      }
    })
    .catch(err => {
      console.log(err)
    })
})
