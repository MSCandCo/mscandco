# Deploying

Using `docker` we can deploy our strapi based backend with only couple of commands with consistency across different platforms. `Dockerfile.prod` and `docker-compose.yml` is included for that reason. It's to be used in production only.

For development, a without-docker flow works best and uses less recourses thus it's recommended.

## Steps

1. Build the images

```
docker compose build
```

2. Create(?) and run the container

```
docker compose up -d
```

Note: if you want to access host machine's ports, use `host.docker.internal` instead of `localhost` or `127.0.0.1`
