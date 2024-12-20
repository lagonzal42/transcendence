
current_dir = $(shell pwd)

all:
	@if docker volume inspect frontend-app > /dev/null 2>&1; then \
		docker volume rm frontend-app; \
	fi
	rm -fr docker-compose.yml
	sed "s|PWD|$(current_dir)|g" docker-compose.model > docker-compose.yml