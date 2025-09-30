pipeline {
    agent any

    environment {
        APP_NAME = 'librarymanagementsystemcairouniversity'
        DEPLOY_DIR = '/var/www/librarymanagementsystem'  // Adjust this to your actual deployment directory
        ENTRY_POINT = 'index.js'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/your-org/your-repo.git', branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Stop Existing App') {
            steps {
                // Kill existing Node process running the app (basic approach)
                sh '''
                PID=$(lsof -t -i:3000 || echo "")
                if [ ! -z "$PID" ]; then
                  kill -9 $PID
                  echo "Stopped existing app on port 3000 (PID: $PID)"
                else
                  echo "No app running on port 3000"
                fi
                '''
            }
        }

        stage('Deploy App') {
            steps {
                sh '''
                mkdir -p $DEPLOY_DIR
                rsync -av --exclude="node_modules" ./ $DEPLOY_DIR/
                cd $DEPLOY_DIR
                npm install --production
                nohup npm start > output.log 2>&1 &
                echo "App deployed and started with nohup"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed.'
        }
    }
}
