all:
	docker compose -f docker-compose.prod.yml up

dev:
	docker compose -f docker-compose.yml up


	