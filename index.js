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
let originalUrl=''
let short = 0

app.post('/api/shorturl', bodyParser.urlencoded({extended: false}), (req, res) => {
  originalUrl = req.body['url']
  // console.log(originalUrl)

  let regexUrl = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi)
  let regexUrl1 = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
  if(!originalUrl.includes("https://") && (!originalUrl.includes('http://'))) {
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
            res.json({original_url:originalUrl,short_url:short})
          })
          .catch(err => {
            console.log(err)
          })   
      })
    .catch(err => {
      console.log(err)
    })
})

app.get('/api/shorturl/:short_url', (req, res) => {
  let input = Number(req.params.short_url)
  console.log(input)
  if(!isNaN(input)) {
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
  }
  else {
    res.json('Please provide number')
  }
})
