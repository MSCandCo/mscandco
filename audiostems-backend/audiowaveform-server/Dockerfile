FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl software-properties-common && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs
RUN add-apt-repository ppa:chris-needham/ppa -y && apt-get update && apt-get install -y audiowaveform

WORKDIR /opt/
COPY . .

EXPOSE 8888
CMD ["node", "shell.js"]