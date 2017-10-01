# node-redis-api

> Simple api to serve in-memory cache data using redis in node.js. If data found in redis then sending data from redis otherwise sending data from json.


## Running Locally

```bash
$ git clone https://github.com/Rjoydip/node-redis-api.git # or clone your own fork
$ cd node-redis-api
$ npm install
$ npm start
```

Your app should now be running on [localhost:3000](http://localhost:3000).

## Server API

### `app.get('/');`

Render index.html

### `app.get('/users');`

Get users list

#### `Response:`

* 200: Success. Payload: list of users and from where data is fetching (redis/json file).
* 422: Error. Payload: `err` -> If something went wrong.

### `app.post('/users');`

Set users in redis.

#### `Response:`

* 200: Success. Payload: `{ resp: "OK"}` -> If data found but if not found then `{ status: null }`.
* 422: Error. Payload: `"{ err": {"status": 404} }` -> If something went wrong.

***Note***
If redis-server shut-down then all stored value will be losed from memory/db.