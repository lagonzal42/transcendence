all:
	docker compose -f docker-compose.yml up

clean:
	docker system prune -af

fclean:
	docker system prune -af --volumes

re: fclean all