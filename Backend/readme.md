## Project Setup Using Docker Compose

This document explains how to start and set up the project using **Docker Compose**.

---

## Prerequisites

Ensure the following are installed and running on your system:

- **Docker Desktop** 
Download from below link
```bash 
https://www.docker.com/products/docker-desktop/
```
- **Node.js ≥ 22** (only required for running npm scripts)
Download from belwo link
```bash
https://nodejs.org/es/download/archive/v22.20.0
```

---

## Start the Project

Run the following command from the project root:

```bash
docker compose up --build
```
---

## Stop the Project
```bash
docker compose down
```
Stops and removes all running containers.

---

## View Logs
```bash
docker compose logs -f
```

---

## Reset the Project (Remove Volumes)
```bash
docker compose down -v
```

---

## Access the Application
All traffic goes through the below base url.
```bash
http://localhost:5001
```

---

## Run application in watch mode / dev mode
```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Access Pg Admin on local
Register server with host, port, user and password on below url
```bash
http://localhost:5051/
```

--- End ---