# Task

### Using NodeJS, write an API that

- accepts a post request with a UTF-8 string payload of 1000 characters
- stores the string in a database (sqlite)
- returns a ROT-13 version of the string

### Limitations:

- No 3rd party libraries may be used for ROT-13

### Personal Challenge

- I attempted to resolve this challenge with minimal external dependencies

## Endpoints

| Method | Route | Params              | Response                                     |
| ------ | ----- | ------------------- | -------------------------------------------- |
| `POST` | `/`   | `body` : plain text | ROT-13 version of request body as plain text |
| `GET`  | `/`   |                     | database contents as csv                     |

## To Start

1. Create `.env` in this directory using `example.env` as a guide
1. Execute `npm i`
1. Execute `npm start`

> **NOTE:** If the database file specified in `.env` does not exist, it will be created on boot
