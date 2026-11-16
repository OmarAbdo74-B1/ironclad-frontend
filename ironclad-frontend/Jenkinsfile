pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        IMAGE_REPO   = 'omarabdo4/butcher-cars-frontend'
        IMAGE_TAG    = "v1.1.${BUILD_NUMBER}"
        GITOPS_REPO  = 'github.com/OmarAbdo74-B1/ironclad-eks-platform.git'
        OVERLAY_PATH = 'app/overlays/dev'
        TRIVY_SERVER = 'http://trivy:4954'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                    docker build --target test -t "$IMAGE_REPO:test-$BUILD_NUMBER" .
                    docker create --name "cov-$BUILD_NUMBER" "$IMAGE_REPO:test-$BUILD_NUMBER"
                    rm -rf coverage
                    docker cp "cov-$BUILD_NUMBER:/app/coverage" ./coverage
                    docker rm "cov-$BUILD_NUMBER"
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonarqube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectVersion=${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build --target runtime -t "$IMAGE_REPO:$IMAGE_TAG" .'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image --server "$TRIVY_SERVER" \
                      --severity HIGH,CRITICAL --exit-code 0 \
                      "$IMAGE_REPO:$IMAGE_TAG"

                    trivy image --server "$TRIVY_SERVER" \
                      --severity CRITICAL --exit-code 1 --ignore-unfixed \
                      "$IMAGE_REPO:$IMAGE_TAG"
                '''
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_TOKEN')]) {
                    sh '''
                        echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                        docker push "$IMAGE_REPO:$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Update GitOps (dev)') {
            steps {
                withCredentials([usernamePassword(
                        credentialsId: 'github-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        rm -rf gitops
                        git clone "https://${GIT_USER}:${GIT_TOKEN}@${GITOPS_REPO}" gitops
                        cd "gitops/${OVERLAY_PATH}"

                        kustomize edit set image "${IMAGE_REPO}=${IMAGE_REPO}:${IMAGE_TAG}"

                        git config user.name  "Jenkins CI"
                        git config user.email "jenkins@ironclad.local"
                        git add kustomization.yaml
                        git commit -m "ci(frontend): deploy ${IMAGE_TAG} to dev" || { echo "No changes"; exit 0; }
                        git pull --rebase origin main
                        git push origin main
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            sh 'docker rmi "$IMAGE_REPO:$IMAGE_TAG" "$IMAGE_REPO:test-$BUILD_NUMBER" || true'
            cleanWs()
        }
        success {
            echo "Frontend ${IMAGE_TAG}: tested, analyzed, scanned, pushed, and deployed to dev."
        }
        failure {
            echo 'Pipeline failed. Check the failed stage logs.'
        }
    }
}
