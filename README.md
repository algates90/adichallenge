# adichallenge/productinventory

This is simple project involving a product inventory that includes querying and consumption. Every inquiry is auto confirmed if requested quantity is available, if not, the quantity is adapted and awaits second level confirmation. Every inquiry is valid only for 1 min to be confirmed.

## Installation

Clone the repository and run the docker compose commands below.

```bash
docker-compose -f docker-compose-dev.yml build --no-cache
docker-compose -f docker-compose-dev.yml up -d --remove-orphans
```

## Usage

Application can be accessed from the following URL
```
http://localhost:49160/
```

It also allows API mode of dicussion for every need.
```
http://localhost:49160/api
```
## Built With
This is a Node JS application built based on ExpressJS with MySQL backend

## Documentation
API Documentation can be obtained from the following URL
```
http://localhost:49160/api-docs/
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
