
current_dir = $(shell pwd)

all:
	docker volume rm frontend-app
	rm -fr docker-compose.yml
	sed "s|PWD|$(current_dir)|g" docker-compose.model > docker-compose.yml