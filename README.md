[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/rashidrazak/aws-cognito-token-provider) 

# AWS Cognito Token Provider

## Problem Statements
1. Queries written in AWS AppSync Console might get deleted sometimes and resulting in lost of query statements.
2. Above problem can be solved by using Postman to send queries but we need the `accessToken` from AWS Cognito. However:
   - We can only write script in Postman. But `aws-sdk` cannot be acquired from within Postman.
   - We cannot execute external script outside of Postman.
3. Executing `aws-cli` commands everytime the `accessToken` expires is such a hassle. Not to mention we hava to copy and paste the new token.

Thank God we can send HTTP request from within Postman, hence I think this is the best way to get going.

## Prerequisites
1. Node.js
2. Postman

## Usage Instructions
In terminal:
1. Get this code
2. Copy `.env-sample` and rename it to `.env`
3. Run `npm start`

In Postman:
1. Go to Pre-request Script and paste the following code:

```javascript
pm.sendRequest("http://localhost:4000/gettoken", function (err, response) {
    pm.environment.set("cognito_access_token", response.json().accessToken);
});
```
2. Done. You don't have to worry about the `accessToken` anymore.

## Todos
In the future we can improve this code by:
1. Implementing `refreshToken`
2. Adding testing