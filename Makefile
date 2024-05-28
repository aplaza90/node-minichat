
build:
	docker build -t node-minichat .

run: build
	docker run -d -p 3000:3000 node-minichat	