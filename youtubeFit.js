const express = require("express");
const app = express();
const porta = 1234;
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParse = require("body-parser");
const axios = require("axios");
const { response } = require("express");

// 871791691479-qtnk7rruts6mcovmrpoie5r2ir0aq28l.apps.googleusercontent.com
// key secret client: we4cSuArKS7CDHyhbH8eBiuE

app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());

app.get("/getURLTing", (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        // client ID
        "871791691479-qtnk7rruts6mcovmrpoie5r2ir0aq28l.apps.googleusercontent.com",
        // client secret
        "we4cSuArKS7CDHyhbH8eBiuE",
        // link to redirect
        "http://localhost:1234/steps"
    );

        const scopes = [

            "https://www.googleapis.com/auth/fitness.activity.read profile email openid"
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            state: JSON.stringify({
                callbackUrl: req.body.callbackUrl,
                userID: req.body.userid
            })
        })

        request(url, (err, response, body) => {
            console.log("error: ", err);
            console.log("statusCode: ", response && response.statusCode);
            res.send({url});
        })
    });

app.get("/steps", async (req,res) => {
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    const oauth2Client = new google.auth.OAuth2(
        // client ID
        "871791691479-qtnk7rruts6mcovmrpoie5r2ir0aq28l.apps.googleusercontent.com",
        // client secret
        "we4cSuArKS7CDHyhbH8eBiuE",
        // link to redirect
        "http://localhost:1234/steps"
    );
        
    const tokens = await oauth2Client.getToken(code);
    console.log(tokens);
    res.send("BORA!");

    let stepArray = [];

    try{
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer  " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data:{
              aggregateBy: [
                  {
                      dataTypeName: "com.google.step_count.delta",
                      dataSourceId: "derived: com.google.step_count.delta:com.google.android.gms:estimated_steps"
                  }
              ],
              bucketByTime: {durationMillis: 86400000},
              
            }
        });
       // console.log(result);
        stepArray = res.data.bucketByTime
    } catch (e){
        console.log(e)
    }
    try {
      for (const dataSet of stepArray){
          console.log(dataSet);
      }  
    } catch (e) {
        console.log(e);
        
    }
    
});

app.listen(porta, () => console.log(`GOOGLE FIT ESTÁ ESCUTANDO NA PORTA: ${porta}`));