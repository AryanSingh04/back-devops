pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t back-devops-app .'
            }
        }

        stage('Run Backend Container') {
            steps {
                sh '''
                  docker stop back-devops-ci || true
                  docker rm back-devops-ci || true

                  docker run -d \
                    -p 3001:3000 \
                    --name back-devops-ci \
                    back-devops-app
                '''
            }
        }
    }
}
