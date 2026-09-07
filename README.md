# SimplePay — DevOps Portfolio Project

## 📌 Project Overview

**SimplePay** is a simple payment application developed primarily to demonstrate **DevOps practices and tools** rather than complex application development.

The application allows users to:

* Register and log in
* View their account balance
* Transfer money to another user
* View transaction history

The main goal of the project is to demonstrate how an application can be **developed, version-controlled, containerized, deployed to Kubernetes, and continuously delivered using Jenkins**.

---

## 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      GitHub      │
                         │  Source Code     │
                         └────────┬─────────┘
                                  │
                                  │ Git
                                  ▼
                         ┌──────────────────┐
                         │     Jenkins      │
                         │     CI/CD        │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
             Docker Build                Docker Build
                    │                           │
                    ▼                           ▼
          Backend Image               Frontend Image
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Docker Hub    │
                         │ Image Registry   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Kubernetes     │
                         │      K3s         │
                         └────────┬─────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌────────────┐    ┌────────────┐    ┌────────────┐
        │  Frontend  │    │  Backend   │    │ PostgreSQL │
        │   NGINX    │───▶│  Node.js   │───▶│  Database  │
        └────────────┘    └────────────┘    └────────────┘
```

---

## 🛠️ Technologies Used

| Technology              | Purpose                             |
| ----------------------- | ----------------------------------- |
| HTML / CSS / JavaScript | Frontend                            |
| NGINX                   | Web server and reverse proxy        |
| Node.js / Express       | Backend REST API                    |
| PostgreSQL              | Application database                |
| Git                     | Version control                     |
| GitHub                  | Source-code repository              |
| Docker                  | Containerization                    |
| Docker Hub              | Container image registry            |
| Kubernetes              | Container orchestration             |
| K3s                     | Lightweight Kubernetes distribution |
| Jenkins                 | CI/CD automation                    |

---

# 📁 Project Structure

```text
simple-pay/
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── database/
│   └── init.sql
│
├── k8s/
│   ├── k8s-backend.yaml
│   ├── k8s-backend-service.yaml
│   ├── k8s-frontend.yaml
│   ├── k8s-frontend-service.yaml
│   ├── k8s-db.yaml
│   ├── k8s-db-service.yaml
│   └── k8s-db-pvc.yaml
│
├── docker-compose.yml
├── Jenkinsfile
├── .gitignore
└── .env
```

> **Note:** `k8s/k8s-secrets.yaml` is intentionally excluded from Git tracking because it contains sensitive configuration.

---

# 1. Application

SimplePay consists of three main components:

```text
┌──────────────┐
│   Frontend   │
│    NGINX     │
└──────┬───────┘
       │
       │ HTTP / API
       ▼
┌──────────────┐
│   Backend    │
│ Node.js /    │
│   Express    │
└──────┬───────┘
       │
       │ PostgreSQL
       ▼
┌──────────────┐
│  PostgreSQL  │
│   Database   │
└──────────────┘
```

## Backend

The backend is implemented using **Node.js and Express**.

### API Endpoints

| Method | Endpoint        | Purpose                      |
| ------ | --------------- | ---------------------------- |
| `GET`  | `/`             | API health/basic response    |
| `POST` | `/register`     | Register a new user          |
| `POST` | `/login`        | Authenticate a user          |
| `GET`  | `/balance`      | Retrieve account balance     |
| `POST` | `/transfer`     | Transfer money               |
| `GET`  | `/transactions` | Retrieve transaction history |

### Authentication

Authentication uses **JWT**.

Passwords are securely hashed using **bcrypt** rather than being stored as plain text.

---

# 2. PostgreSQL Database

SimplePay uses **PostgreSQL** for persistent application data.

The database contains three main tables:

### `users`

Stores user information such as names, email addresses, and password hashes.

### `accounts`

Stores user account balances.

### `transactions`

Stores money-transfer history.

The initial database schema is located at:

```text
database/init.sql
```

---

# 3. Git and GitHub

The project is managed using **Git** and hosted on **GitHub**.

Git is used to:

* Track source-code changes
* Maintain project history
* Commit configuration changes
* Integrate the repository with Jenkins

Sensitive files are excluded using `.gitignore`.

Current ignored files include:

```text
node_modules/
.env
*.log
k8s/k8s-secrets.yaml
```

---

# 4. Docker

Both the frontend and backend are containerized using Docker.

## Backend Image

```text
yasmeen322/simplepay-backend:latest
```

The backend Docker image is based on:

```text
node:20-alpine
```

The build process is:

```text
Node.js 20 Alpine
       │
       ▼
Copy package files
       │
       ▼
Install dependencies
       │
       ▼
Copy application source
       │
       ▼
Expose port 3000
       │
       ▼
Start Node.js server
```

## Frontend Image

```text
yasmeen322/simplepay-frontend:latest
```

The frontend image is based on:

```text
nginx:alpine
```

NGINX serves the static frontend files and handles API requests through its reverse-proxy configuration.

---

# 5. NGINX Reverse Proxy

NGINX is used as both:

* A web server for the frontend
* A reverse proxy for backend API requests

The frontend sends API requests to:

```text
/api
```

NGINX forwards these requests to the Kubernetes backend Service:

```text
simplepay-backend:3000
```

The request flow is:

```text
┌──────────┐
│ Browser  │
└────┬─────┘
     │
     │ /api
     ▼
┌──────────┐
│  NGINX   │
└────┬─────┘
     │
     │ simplepay-backend:3000
     ▼
┌──────────┐
│ Backend  │
└──────────┘
```

This allows the frontend to communicate with the backend without directly depending on individual backend Pod IP addresses.

---

# 6. Kubernetes

The application is deployed to a **K3s Kubernetes cluster**.

The application runs in the following namespace:

```text
simplepay
```

The Kubernetes architecture consists of:

```text
                     Kubernetes / K3s
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Frontend   │   │   Backend   │   │ PostgreSQL  │
   │ Deployment  │   │ Deployment  │   │ Deployment  │
   │ 3 replicas  │   │ 3 replicas  │   │ 1 replica   │
   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
          │                 │                 │
          ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Frontend   │   │   Backend   │   │ PostgreSQL  │
   │   Service   │   │   Service   │   │   Service   │
   │   NodePort  │   │  ClusterIP  │   │  ClusterIP  │
   └─────────────┘   └─────────────┘   └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │     PVC     │
                                       │ Persistent  │
                                       │   Storage   │
                                       └─────────────┘
```

---

## 6.1 Frontend Deployment

The frontend Deployment runs:

```text
3 replicas
```

This provides multiple frontend Pods managed by Kubernetes.

The frontend is exposed using a **NodePort Service**:

```text
Service: simplepay-frontend
Type:    NodePort
Port:    30080
```

The application can be accessed through:

```text
http://<KUBERNETES_NODE_IP>:30080
```

---

## 6.2 Backend Deployment

The backend Deployment runs:

```text
3 replicas
```

The backend is exposed internally using a **ClusterIP Service**:

```text
Service: simplepay-backend
Type:    ClusterIP
Port:    3000
```

The Service provides a stable internal DNS name:

```text
simplepay-backend:3000
```

Kubernetes handles routing traffic between the three backend Pods.

The backend Pods therefore do not require fixed IP addresses.

---

## 6.3 PostgreSQL Deployment

PostgreSQL currently runs with:

```text
1 replica
```

This is intentional.

Running multiple PostgreSQL Pods behind a Kubernetes Service does **not** automatically provide database replication or high availability.

For this project, PostgreSQL uses a single Pod with persistent storage.

---

# 7. Kubernetes Services

SimplePay uses three Kubernetes Services.

| Service              | Type      |    Port | Purpose                           |
| -------------------- | --------- | ------: | --------------------------------- |
| `simplepay-frontend` | NodePort  | `30080` | External frontend access          |
| `simplepay-backend`  | ClusterIP |  `3000` | Internal backend communication    |
| `simplepay-db`       | ClusterIP |  `5432` | Internal PostgreSQL communication |

The backend connects to PostgreSQL through:

```text
simplepay-db:5432
```

---

# 8. Persistent Storage

PostgreSQL uses a Kubernetes **PersistentVolumeClaim (PVC)**.

```text
┌──────────────────┐
│ PostgreSQL Pod   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ PersistentVolume │
│      Claim       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Persistent       │
│    Storage       │
└──────────────────┘
```

The PVC requests:

```text
Storage:     1Gi
Access Mode: ReadWriteOnce
```

Database persistence was tested by deleting the PostgreSQL Pod and verifying that the database data remained available after the Pod was recreated.

This demonstrates the difference between:

* **Pod lifecycle**
* **Persistent data lifecycle**

---

# 9. Kubernetes Secrets

Sensitive configuration is provided to Kubernetes using a **Secret**.

The application requires values such as:

```text
DB_PASSWORD
JWT_SECRET
```

The backend retrieves these values using Kubernetes `secretKeyRef`.

The secret manifest is intentionally not tracked by Git:

```text
k8s/k8s-secrets.yaml
```

and is excluded through `.gitignore`.

---

# 10. Jenkins CI/CD

Jenkins automates the build and deployment process.

The pipeline is defined in:

```text
Jenkinsfile
```

The current pipeline consists of six stages:

```text
┌──────────────┐
│   Checkout   │
└──────┬───────┘
       ▼
┌──────────────────────┐
│ Build Backend Image  │
└──────────┬───────────┘
           ▼
┌───────────────────────┐
│ Build Frontend Image  │
└──────────┬────────────┘
           ▼
┌──────────────────────┐
│    Push Images       │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Deploy to Kubernetes │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Verify Deployment    │
└──────────────────────┘
```

---

## 10.1 Checkout

Jenkins retrieves the latest source code from the GitHub repository.

---

## 10.2 Build Backend Image

Jenkins builds the backend Docker image:

```bash
docker build -t yasmeen322/simplepay-backend:latest ./backend
```

---

## 10.3 Build Frontend Image

Jenkins builds the frontend Docker image:

```bash
docker build -t yasmeen322/simplepay-frontend:latest ./frontend
```

---

## 10.4 Push Images

Jenkins authenticates with Docker Hub using a Jenkins-managed credential.

The pipeline then pushes both images:

```text
Backend Image
     │
     ▼
Docker Hub

Frontend Image
     │
     ▼
Docker Hub
```

Docker Hub credentials are **not hardcoded into the Jenkinsfile**.

---

## 10.5 Deploy to Kubernetes

Jenkins connects to the K3s cluster using a dedicated kubeconfig.

The pipeline restarts the application Deployments:

```bash
kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
    -n simplepay rollout restart deployment simplepay-backend

kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
    -n simplepay rollout restart deployment simplepay-frontend
```

This causes Kubernetes to perform a new rollout of the application Pods.

---

## 10.6 Verify Deployment

Jenkins verifies that the new Deployments successfully complete their rollout:

```bash
kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
    -n simplepay rollout status deployment/simplepay-backend

kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
    -n simplepay rollout status deployment/simplepay-frontend
```

If the rollout fails, the Jenkins pipeline fails.

---

# 11. Jenkins and Docker Integration

Jenkins runs inside a Docker container.

To allow Jenkins to build Docker images, the host Docker socket is mounted into the Jenkins container:

```text
/var/run/docker.sock
```

The architecture is:

```text
┌──────────────────────────┐
│     Jenkins Container    │
│                          │
│  Jenkins Pipeline        │
│          │               │
│          ▼               │
│     Docker CLI           │
└──────────┬───────────────┘
           │
           │ Docker Socket
           ▼
┌──────────────────────────┐
│    Host Docker Daemon    │
│                          │
│  ├── Backend Image       │
│  └── Frontend Image      │
└──────────────────────────┘
```

This allows Jenkins to execute Docker commands against the host Docker daemon.

---

# 12. Jenkins and Kubernetes Integration

Jenkins also has access to the K3s cluster through a dedicated kubeconfig mounted into the Jenkins container.

```text
┌─────────────────────┐
│ Jenkins Container   │
│                     │
│ kubectl             │
└──────────┬──────────┘
           │
           │ kubeconfig
           ▼
┌─────────────────────┐
│ Kubernetes / K3s    │
│                     │
│ ├── Frontend        │
│ ├── Backend         │
│ └── PostgreSQL      │
└─────────────────────┘
```

This allows Jenkins to perform Kubernetes deployment and rollout operations automatically.

---

# 13. Complete CI/CD Flow

The complete workflow is:

```text
Developer
    │
    │ git push
    ▼
┌──────────────┐
│    GitHub    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Jenkins   │
└──────┬───────┘
       │
       ├── Checkout
       │
       ├── Build Backend
       │
       ├── Build Frontend
       │
       ├── Push Images
       │
       ▼
┌──────────────┐
│  Docker Hub  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Kubernetes / K3s│
└────────┬─────────┘
         │
         ├── Frontend Pods
         │
         ├── Backend Pods
         │
         └── PostgreSQL Pod
         │
         ▼
┌──────────────────┐
│ Running SimplePay│
└──────────────────┘
```

---

# 14. Current Project Status

## Application

* [x] Simple payment application
* [x] Node.js / Express backend
* [x] PostgreSQL database
* [x] User registration and login
* [x] JWT authentication
* [x] Password hashing with bcrypt
* [x] Balance management
* [x] Money transfers
* [x] Transaction history

## Version Control

* [x] Git repository
* [x] GitHub repository
* [x] `.gitignore`
* [x] Sensitive configuration excluded from Git tracking

## Containerization

* [x] Backend Dockerfile
* [x] Frontend Dockerfile
* [x] Backend Docker image
* [x] Frontend Docker image
* [x] Docker Hub images

## NGINX

* [x] Frontend web server
* [x] Reverse proxy
* [x] Backend API routing

## Kubernetes

* [x] K3s cluster
* [x] `simplepay` namespace
* [x] Frontend Deployment
* [x] Backend Deployment
* [x] PostgreSQL Deployment
* [x] Frontend NodePort Service
* [x] Backend ClusterIP Service
* [x] PostgreSQL ClusterIP Service
* [x] Kubernetes Secret
* [x] PersistentVolumeClaim
* [x] Database persistence testing

## Jenkins

* [x] Jenkins installation
* [x] Persistent Jenkins storage
* [x] Docker integration
* [x] Kubernetes integration
* [x] Docker Hub credentials
* [x] Jenkins Pipeline
* [x] Automated Docker image builds
* [x] Automated Docker Hub pushes
* [x] Automated Kubernetes deployment
* [x] Automated deployment verification
* [x] Successful end-to-end pipeline execution

---

# 15. Future DevOps Improvements

The next planned stages are:

```text
Current
│
├── Git / GitHub
├── Docker
├── Docker Compose
├── NGINX
├── Kubernetes
└── Jenkins CI/CD
        │
        ▼
Planned
│
├── Ansible
└── Prometheus + Grafana
```

These stages will add:

* Configuration management
* Infrastructure automation
* Monitoring
* Metrics collection
* Visualization
* Operational observability

---

# 🎯 Project Goal

SimplePay is intentionally a **simple application**. The primary objective is not to build a sophisticated payment platform, but to demonstrate a practical DevOps workflow around a real application.

The project demonstrates the following lifecycle:

```text
Code
  │
  ▼
Version Control
  │
  ▼
Containerization
  │
  ▼
Container Registry
  │
  ▼
Kubernetes
  │
  ▼
CI/CD
  │
  ▼
Configuration Management
  │
  ▼
Monitoring
```

The application provides a simple workload that allows the implementation and demonstration of modern DevOps tools and practices.
