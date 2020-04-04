"use strict";

const express = require("express");
const dotenv = require("dotenv");
global.fetch = require("node-fetch");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let runTime = 1;
let accessToken = null;
let expiryTimeInMinutes = process.env.TOKEN_EXPIRY;
let startTime = new Date();
let endTime = new Date(startTime.getTime() + expiryTimeInMinutes * 60000);

app.get("/", (req, res, next) => {
  res.status(200).send("AWS Cognito Token Provider");
});

app.get("/gettoken", (req, res, next) => {

  let isValid = determineValidity();
  console.log(`Access Token is valid? ${isValid}`);
  if (!isValid || runTime === 1) {
    console.log(`Access Token is INVALID`);
    login((error, result) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({
          message: "Internal server error LOL"
        });
      }

      if (!result) {
        console.log(`Result not found`);
        return res.status(404).json({
          message: "404 not found"
        });
      }

      startTime = new Date();
      endTime = new Date(startTime.getTime() + expiryTimeInMinutes * 60000);
      runTime++
      setAccessToken(result);
      console.log(`Token: ${accessToken}`);
      return res.status(200).json({
        accessToken: accessToken
      });
    });
  } else {
    console.log(`Access Token is still VALID`);
    accessToken = getAccessToken();
    console.log(`Token: ${accessToken}`);
    return res.status(200).json({
      accessToken: accessToken
    });
  }  
});

function determineValidity() {
  let valid = false;
  let now = Date.now();
  let diff = endTime - now;
  if (diff <= 0) {
    valid = false;
  } else {
    valid = true;
  }

  return valid;
}

function setAccessToken(access_token) {
  accessToken = access_token;
}

function getAccessToken() {
  return accessToken;
}

function login(callback) {
  const user_name = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: user_name,
      Password: password
    }
  );

  const pool_data = {
    UserPoolId: process.env.POOL_ID,
    ClientId: process.env.CLIENT_ID
  };
  const pool_region = process.env.POOL_REGION;
  const user_pool = new AmazonCognitoIdentity.CognitoUserPool(pool_data);

  const user_data = {
    Username: user_name,
    Pool: user_pool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(user_data);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      var accesstoken = result.getAccessToken().getJwtToken();
      callback(null, accesstoken);
    },
    onFailure: function(err) {
      callback(err);
    }
  });
}

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
