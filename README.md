# Node minichat

## Content

The repository contains all the code of a minichat app, that allows the users
 to connect to the server and chat using their names. the messages are recovered
 if a user loses conection or a new user enters the chat. the massages are backed
 up into a sql db. In the remote branche the db is a turso (sqlite) db.

 The client app is entirely in vanilla JS.

 When deployed, the container listens in the localhost, port 3000

## Code Design
the code consists of a server and a client file


## Requirements

* docker 

## Building and running the container

```sh
make run
```
