pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'yasmeen322'
        BACKEND_IMAGE = "${DOCKERHUB_USER}/simplepay-backend:latest"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/simplepay-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $BACKEND_IMAGE
                        docker push $FRONTEND_IMAGE
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
                        -n simplepay rollout restart deployment simplepay-backend

                    kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
                        -n simplepay rollout restart deployment simplepay-frontend
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
                        -n simplepay rollout status deployment/simplepay-backend

                    kubectl --kubeconfig=/etc/k3s-jenkins.yaml \
                        -n simplepay rollout status deployment/simplepay-frontend
                '''
            }
        }
    }
}
