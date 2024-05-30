# Node minichat

## Content

The repository contains all the code of a minichat app, that allows the users
 to connect to the server and chat using their names. The messages are recovered
 if a user loses conection or a new user enters the chat. The massages are backed
 up into a sql db, that will be deployed in another container. 

 The client app is entirely in vanilla JS.

 When deployed, the chat is listening the localhost, port 3000

## Design
the code consists of a socket.io server that serves a simple `index.html` file with all the styles and JS. The db use to back the chat messages up is congigurable via the `dbController` parameter in the `chat.js` file. All the db configurations will be in separate directories, being that controllers the only extension point so far. 


## Requirements

* docker 
* docker-compose

## Building and running the container

```sh
make up
```
