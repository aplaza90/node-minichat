
build:
	docker-compose build

up: build
	docker-compose up -d node-minichat	

down:
	docker-compose down	