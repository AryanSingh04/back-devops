pipeline {
    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t back-devops-app .'
            }
        }

        stage('Run Backend Container') {
            steps {
                sh '''
                  docker rm -f back-devops-container || true
                  docker run -d -p 3001:3000 --name back-devops-container back-devops-app
                '''
            }
        }
    }
}
