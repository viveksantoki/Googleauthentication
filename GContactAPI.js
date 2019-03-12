const {google} = require('googleapis');
var express=require('express');
var url = require('url');
var ls = require('local-storage');
var app=express();



const googleConfig = {
    clientId: '499345710096-6r606gu9j7h00dvle2dt1bh40q45helf.apps.googleusercontent.com',//ClientId
    clientSecret: 'AXz5ypxsE8YJVhYiIEyFzbfC', //ClientSeceretKey
    redirect: 'http://localhost:4200/RedirectHome'//redirection link
  };

  const oauth2Client = new google.auth.OAuth2(
    '499345710096-6r606gu9j7h00dvle2dt1bh40q45helf.apps.googleusercontent.com',//ClientId
    'AXz5ypxsE8YJVhYiIEyFzbfC', //ClientSeceretKe'
    'http://localhost:4200/RedirectHome' //redirection link
  );

  function createConnection() {
    return new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect
    );
  }

  const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/contacts.readonly'
  ];

  function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
      scope: defaultScope
    });
  }


function urlGoogle() {
    const auth = createConnection(); // this is from previous step
    const url = getConnectionUrl(auth);
    return url;
  }


  app.get('/',function(red,res){
     res.redirect(urlGoogle());
  });

app.get('/RedirectHome',async function(red,response){
  
    var q = url.parse(red.url, true);
    const {tokens} = await oauth2Client.getToken(q.query.code);
    oauth2Client.setCredentials(tokens);
    ls.set('rtoken',tokens);
    response.redirect('/contact'); 
});


app.get('/contact',function(red,response){
  oauth2Client.setCredentials(ls.get('rtoken'));
  const peopleService = google.people({
    version: 'v1', 
    auth: oauth2Client
  });

  
  peopleService.people.connections.list({
       resourceName: 'people/me',
      personFields: 'names,phoneNumbers'
      },(err, res) => {
         if(err)
         {
           console.log(err);
         }
         else
         {
           response.send(JSON.stringify(res.data.connections));
          }
  });
});
app.listen(4200);

module.exports=app;