
current_dir = $(shell pwd)

all:
	docker volumes rm $(docker volume ls -q)
	rm -fr docker-compose.yml
	sed "s|PWD|$(current_dir)|g" docker-compose.model > docker-compose.yml