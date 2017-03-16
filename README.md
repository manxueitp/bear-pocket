# Bear's pocket

### how to run the app
##### Set up the app (git repository&heroku app)
1. clone this repository locally
2. Run **npm install** to get all required libraries.
```
npm install
```

3. if you already set up a heroku app, set remote heroku app to the repository
```
git remote add heroku git@heroku.com:projuct name.git
```
if not, create a new heroku app
```
heroku create
```
NOTE: if it is your very FIRST time setting up a Heroku app, you will need to upload a public key to Heroku. See http://stackoverflow.com/a/6059231. As explained in that StackOverlow link, if you don't yet have a public key, you'll be prompted to add one.
```
heroku rename new-app-name
heroku open
```

##### Set up mangoDB database
4. Add MongoLabs Starter MongoDB to your heroku app:
```
heroku addons:create mongolab
```
If you log-in to your heroku dashboard at [https://heroku.com](https://heroku.com), you'll now see this as an add-on. Click on the 'MongoLab' link to see your database.

5. Get the Heroku MongoLab connection string into an .env file.
```
heroku config --shell | grep MONGODB_URI >> .env
```
Your connection string to MongoDB will now be in a .env file now (go have a look at the .env file). Your app connects to this database in the app.js file:
```
app.db = mongoose.connect(process.env.MONGODB_URI);
```

Your .env file is a secret config file that holds key app variables like this MongoDB URI string, and other things like 3rd Party API secrets and keys. It is specified in the .gitignore file, which means the .env file will not be tracked by .git and not available for others to see on github (this is good).

##### Starting the Server
6. Now it's ready to go!! Run **npm start** to start the server
```
npm start
```
You can stop the server with Ctrl+C.

However, every time you change your code, you'll need to stop and restart your server.

A better solution is to auto restart your server after you make some changes to your code. To do this, **install Nodemon**. Nodemon will watch your files and restart the server for you whenever your code changes.

Install Nodemon (you only need to do this once, and then it will be installed globally on your machine). In Terminal,
```
npm install -g nodemon
```

Now you can start with
```
nodemon
```

##### Push your code to heroku and Github
To get your updated code to **heroku**
```
git add .
git commit -m ""
git push heroku master
```

To get your updated code to **GitHub**
```
git add .
git commit -m ""
git push origin master
```

You can also update them together
```
git add .
git commit -am "your commit message"
git push origin master
git push heroku master

```

