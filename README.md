SimplePay — DevOps Portfolio Project
📌 Project Overview

SimplePay is a simple payment application developed primarily to demonstrate DevOps practices and tools rather than complex application development.

The application allows users to:

Register and log in
View their account balance
Transfer money to another user
View transaction history

The main goal of the project is to demonstrate how an application can be developed, containerized, version-controlled, deployed to Kubernetes, and continuously delivered using Jenkins.

🏗️ Current Architecture
                         ┌──────────────────┐
                         │      GitHub      │
                         │  Source Code     │
                         └────────┬─────────┘
                                  │
                                  │ Git
                                  ▼
                         ┌──────────────────┐
                         │     Jenkins      │
                         │    CI/CD         │
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
🛠️ Technologies Used
Technology	Purpose
HTML / CSS / JavaScript	Frontend
NGINX	Frontend web server and reverse proxy
Node.js / Express	Backend REST API
PostgreSQL	Application database
Git	Version control
GitHub	Remote source-code repository
Docker	Containerization
Docker Hub	Container image registry
Kubernetes	Container orchestration
K3s	Lightweight Kubernetes distribution
Jenkins	CI/CD automation
📁 Project Structure
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
│   ├── k8s-db-pvc.yaml
│   └── k8s-secrets.yaml
│
├── docker-compose.yml
├── Jenkinsfile
├── .gitignore
└── .env

k8s/k8s-secrets.yaml is intentionally excluded from Git tracking because it contains sensitive configuration.

1. Application

The application consists of three main components:

Frontend
   │
   │ HTTP
   ▼
Backend API
   │
   │ PostgreSQL
   ▼
Database
Backend

The backend is implemented using Node.js and Express.

Main API endpoints:

Method	Endpoint	Purpose
GET	/	API health/basic response
POST	/register	Register a new user
POST	/login	Authenticate a user
GET	/balance	Retrieve account balance
POST	/transfer	Transfer money
GET	/transactions	Retrieve transaction history

Authentication uses JWT.

Passwords are stored using bcrypt hashing rather than plain text.

2. PostgreSQL Database

The application uses PostgreSQL for persistent data storage.

The database contains:

users

Stores user information.

accounts

Stores account balances.

transactions

Stores money-transfer history.

The initial database schema is stored in:

database/init.sql
3. Git and GitHub

The project is version-controlled using Git.

The source code is hosted on GitHub.

Git is used to:

Track application changes
Commit configuration changes
Maintain the project history
Trigger the Jenkins CI/CD pipeline

Sensitive files are excluded using .gitignore.

Current ignored files include:

node_modules/
.env
*.log
k8s/k8s-secrets.yaml
4. Docker

Both the frontend and backend are containerized.

Backend Docker Image

The backend image is:

yasmeen322/simplepay-backend:latest

The backend Dockerfile uses Node.js 20 Alpine.

Basic process:

Node.js base image
        │
        ▼
Install dependencies
        │
        ▼
Copy application
        │
        ▼
Expose port 3000
        │
        ▼
Start server
Frontend Docker Image

The frontend image is:

yasmeen322/simplepay-frontend:latest

It uses NGINX Alpine.

The frontend container serves the static application files through NGINX.

5. NGINX Reverse Proxy

NGINX is used as the frontend web server.

It also acts as a reverse proxy for backend API requests.

The browser communicates with:

/api

NGINX forwards these requests to:

simplepay-backend:3000

This means the browser does not need to directly know the backend Pod's IP address.

Browser
   │
   │ /api
   ▼
NGINX
   │
   │ simplepay-backend:3000
   ▼
Backend
6. Kubernetes

The application is deployed to a K3s Kubernetes cluster.

The Kubernetes namespace used by the application is:

simplepay

The cluster currently contains:

Frontend Deployment
        │
        ▼
Frontend Service
        │
        ▼
NGINX Pods


Backend Deployment
        │
        ▼
Backend Service
        │
        ▼
Node.js Pods


PostgreSQL Deployment
        │
        ▼
PostgreSQL Service
        │
        ▼
PostgreSQL Pod
        │
        ▼
Persistent Volume
Frontend Deployment

The frontend runs with:

3 replicas

This demonstrates Kubernetes Deployment scaling and provides multiple frontend Pods.

The frontend is exposed through a NodePort:

30080

The application can therefore be accessed through:

http://<KUBERNETES_NODE_IP>:30080
Backend Deployment

The backend runs with:

3 replicas

Kubernetes distributes requests between the backend Pods through the backend Service.

The backend Service provides the stable internal DNS name:

simplepay-backend:3000

The backend Pods do not need fixed IP addresses.

PostgreSQL Deployment

PostgreSQL currently runs with:

1 replica

This is intentional.

Running multiple PostgreSQL Pods behind a Kubernetes Service does not automatically create database replication or high availability.

The database therefore uses a single PostgreSQL Pod with persistent storage.

7. Kubernetes Services

Three Kubernetes Services are currently used.

Frontend Service
simplepay-frontend

Type:

NodePort

Port:

30080
Backend Service
simplepay-backend

Type:

ClusterIP

Port:

3000

It is accessible internally by Kubernetes DNS.

Database Service
simplepay-db

Type:

ClusterIP

Port:

5432

The backend connects to PostgreSQL using:

simplepay-db:5432
8. Persistent Storage

PostgreSQL uses a Kubernetes PersistentVolumeClaim (PVC).

PostgreSQL Pod
      │
      ▼
PersistentVolumeClaim
      │
      ▼
Persistent Storage

The PVC requests:

1Gi

with:

ReadWriteOnce

The database persistence was tested by deleting the PostgreSQL Pod and confirming that the database data remained available after the Pod was recreated.

This demonstrates the difference between:

Pod lifecycle
Persistent data lifecycle
9. Kubernetes Secrets

Sensitive configuration such as:

DB_PASSWORD
JWT_SECRET

is provided to Kubernetes through a Secret.

The backend retrieves these values using:

secretKeyRef

The secret manifest is not tracked by Git.

k8s/k8s-secrets.yaml

is included in .gitignore.

10. Jenkins CI/CD

Jenkins is used to automate the application's build and deployment process.

The Jenkins Pipeline is defined in:

Jenkinsfile

The pipeline currently performs the following stages:

Checkout
   ↓
Build Backend Image
   ↓
Build Frontend Image
   ↓
Push Images
   ↓
Deploy to Kubernetes
   ↓
Verify Deployment
Checkout

Jenkins retrieves the latest source code from GitHub.

Build Backend Image

Jenkins executes:

docker build -t yasmeen322/simplepay-backend:latest ./backend

This creates the backend container image.

Build Frontend Image

Jenkins executes:

docker build -t yasmeen322/simplepay-frontend:latest ./frontend

This creates the frontend container image.

Push Images

Jenkins authenticates with Docker Hub using a Jenkins credential and pushes both images.

Backend Image
      │
      ▼
Docker Hub

Frontend Image
      │
      ▼
Docker Hub

The Docker Hub credential is stored in Jenkins rather than being hardcoded into the Jenkinsfile.

Deploy to Kubernetes

Jenkins connects to the K3s cluster using a dedicated kubeconfig.

It restarts the application Deployments:

kubectl rollout restart deployment simplepay-backend
kubectl rollout restart deployment simplepay-frontend

This causes Kubernetes to create new Pods using the updated container images.

Verify Deployment

Jenkins waits for both Deployments to successfully complete their rollout.

kubectl rollout status deployment/simplepay-backend
kubectl rollout status deployment/simplepay-frontend

If the rollout fails, the Jenkins pipeline fails.

11. Jenkins and Docker Integration

Jenkins runs inside a Docker container.

To allow Jenkins to build Docker images, the Docker socket is mounted into the Jenkins container:

/var/run/docker.sock

This allows the Jenkins container to communicate with the Docker daemon on the host.

Conceptually:

Jenkins Container
       │
       │ Docker socket
       ▼
Host Docker Daemon
       │
       ├── Build backend image
       └── Build frontend image

Jenkins also has access to the Kubernetes cluster through a dedicated kubeconfig mounted into the container.

This allows the pipeline to perform Kubernetes deployment operations.

12. Current CI/CD Flow

When changes are pushed to GitHub, the intended deployment workflow is:

Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
Jenkins
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
Docker Hub
    │
    ▼
Kubernetes / K3s
    │
    ├── Backend Pods
    ├── Frontend Pods
    └── PostgreSQL Pod
    │
    ▼
Running SimplePay Application
13. What Has Been Completed

The following parts of the project are currently implemented:

Simple payment application

Node.js/Express backend

PostgreSQL database

User authentication

JWT authentication

Dockerized backend

Dockerized frontend

NGINX reverse proxy

Git repository

GitHub repository

.gitignore configuration

Docker Hub images

K3s Kubernetes cluster

Kubernetes namespace

Backend Deployment

Backend Service

Frontend Deployment

Frontend NodePort Service

PostgreSQL Deployment

PostgreSQL Service

PostgreSQL PersistentVolumeClaim

Kubernetes Secrets

Database persistence testing

Jenkins installation

Jenkins persistent storage

Jenkins Docker integration

Jenkins Kubernetes integration

Docker Hub Jenkins credentials

Jenkins Pipeline

Automated Docker image builds

Automated Docker Hub pushes

Automated Kubernetes deployment

Automated deployment verification

14. Planned DevOps Improvements

The next stages of the project will focus on expanding the DevOps infrastructure.

Planned components:

Current
│
├── Git/GitHub
├── Docker
├── Docker Compose
├── NGINX
├── Kubernetes
└── Jenkins CI/CD
        │
        ▼
Next
│
├── Ansible
└── Prometheus + Grafana

These additions will demonstrate:

Configuration management
Infrastructure automation
Monitoring
Metrics collection
Visualization
Operational observability
🎯 Project Goal

The purpose of SimplePay is not to build a sophisticated payment platform.

The primary goal is to demonstrate the DevOps lifecycle of an application:

Code
 ↓
Version Control
 ↓
Containerization
 ↓
Image Registry
 ↓
Orchestration
 ↓
CI/CD
 ↓
Configuration Management
 ↓
Monitoring

The application provides a simple but realistic workload on which these DevOps technologies can be demonstrated.
