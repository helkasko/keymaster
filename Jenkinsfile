pipeline {
  agent {
    kubernetes {
      yaml """\
        apiVersion: v1
        kind: Pod
        spec:
          serviceAccountName: asti-common-devops-jenkins-agent
          nodeSelector:
            eks.amazonaws.com/capacityType: SPOT
          containers:
          - name: docker
            image: docker:19.03.1
            command:
            - sleep
            args:
            - 99d
            env:
              - name: DOCKER_HOST
                value: tcp://localhost:2375
          - name: docker-daemon
            image: docker:19.03.1-dind
            securityContext:
              privileged: true
            env:
              - name: DOCKER_TLS_CERTDIR
                value: ""
      """.stripIndent()
    }
  }
  environment {
    appName = "keymaster"
  }
  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
  }
  stages {
    stage('Build Container') {
      steps {
        container('docker') {
          sh 'apk add --update  python python-dev py-pip build-base'
          sh "DOCKER_BUILDKIT=1 docker build -t ${appName} ."
        }
      }
    }
    stage('Deploy tag to ECR') {
      when {
        anyOf {
          buildingTag()
          branch 'master'
        }
      }
      steps {
        container('docker') {
          script {
            def tagName = "latest"
            if (buildingTag()) tagName = "$TAG_NAME"
            sh 'pip --no-cache-dir install awscli'
            sh("eval \$(aws ecr get-login --no-include-email --region eu-north-1 | sed 's|https://||')")
            sh "docker tag ${appName}:latest 743790536429.dkr.ecr.eu-north-1.amazonaws.com/infra/${appName}:${tagName}"
            sh "docker push 743790536429.dkr.ecr.eu-north-1.amazonaws.com/infra/${appName}:${tagName}"
          }
        }
      }
    }
  }
}
