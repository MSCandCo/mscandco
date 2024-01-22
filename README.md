# Deploying

Using `docker` we can deploy our strapi based backend with only couple of commands with consistency across different platforms. `Dockerfile.prod` is included for that reason. It's to be used in production only.

For development, a without-docker flow works best and uses less recourses thus it's recommended.

## Steps

1. Build the image

```
docker build -t audiostems:latest -f Dockerfile.prod .
```

2. Run the container

```
docker run --env-file ./.env -dp 1337:1337 -v uploads:/opt/app/public/uploads audiostems:latest
```

Note: if you want to access host machine's ports, use `host.docker.internal` instead of `localhost` or `127.0.0.1`
