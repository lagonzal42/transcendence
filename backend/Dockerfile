FROM python:3.9

# prevents Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Python output (stdout and stderr) is sent directly to the terminal (without being buffered)
ENV PYTHONUNBUFFERED=1


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

