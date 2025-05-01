FROM python:3.9


WORKDIR /code
COPY requirements.txt /code/backend/
COPY run.sh /code/backend/

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r /code/backend/requirements.txt

# Give permission
RUN chmod +x /code/backend/run.sh

EXPOSE 8000

CMD ["sh", "/code/backend/run.sh"]

