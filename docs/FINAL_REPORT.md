# Project 7: Movie Recommendation System with Full DevOps Pipeline
## Final Technical Submission & Academic Report

**Student Name**: Yuvas  
**Course**: Cloud Computing & DevOps Engineering  
**Project Title**: CineMatch - Movie Recommendation System  
**Submission Date**: August 2026  

---

## Executive Summary
This report presents the design, architectural foundation, microservices implementation, containerization, CI/CD automation, Infrastructure-as-Code (IaC), cloud deployment, and telemetry monitoring for **CineMatch**—an AI-assisted Movie Recommendation System.

### Submission Checklist & Project Artifacts
- **Architecture Diagram**: Included in Section 1 & `docs/ARCHITECTURE.md`
- **GitHub Repository**: `https://github.com/yuvas/movie-recommendation-devops`
- **DockerHub Repository**: `https://hub.docker.com/r/yuvas/cinematch-backend` & `yuvas/cinematch-frontend`
- **AWS EC2 Deployment Link**: `http://<EC2_PUBLIC_IP>` (Port 80)
- **Backend API Endpoint**: `http://<EC2_PUBLIC_IP>:3000/api/movies`
- **Demo Video Script**: `docs/DEMO_VIDEO_SCRIPT.md` (5-10 minute presentation guide)

---

## 1. Architecture Diagram & Technical Design

```
+-----------------------------------------------------------------------------------+
|                                   USER CLIENT                                     |
|                        Web Browser (HTML5 / Glassmorphism UI)                      |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             AWS CLOUD INFRASTRUCTURE                              |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                        VPC (10.0.0.0/16) / Public Subnet                  |   |
|   |                                                                           |   |
|   |   +-------------------------------------------------------------------+   |   |
|   |   |            AWS Security Group (Ports 22, 80, 3000, 8080)           |   |   |
|   |   +---------------------------------+---------------------------------+   |   |
|   |                                     |                                     |   |
|   |                                     v                                     |   |
|   |   +-------------------------------------------------------------------+   |   |
|   |   |                        AWS EC2 INSTANCE                           |   |   |
|   |   |                                                                   |   |   |
|   |   |   +--------------------------+     +--------------------------+   |   |   |
|   |   |   | Frontend Container       |     | Backend Container        |   |   |   |
|   |   |   | (Nginx - Port 80)        |---->| (Express API - Port 3000)|   |   |   |
|   |   |   +--------------------------+     +------------+-------------+   |   |   |
|   |   |                                                 |                 |   |   |
|   |   |   +--------------------------+                  v                 |   |   |
|   |   |   | CloudWatch Agent         |     +--------------------------+   |   |   |
|   |   |   | (Logs & Telemetry)       |     | Cosine Similarity Engine |   |   |   |
|   |   |   +------------+-------------+     +--------------------------+   |   |   |
|   |   |                |                                                  |   |   |
|   |   +----------------|--------------------------------------------------+   |   |
|   |                    |                                                      |   |
|   +--------------------|------------------------------------------------------+   |
|                        v                                                          |
|       +----------------------------------+    +-------------------------------+   |
|       | Amazon CloudWatch Dashboard      |    | Amazon S3 Storage Bucket      |   |
|       | & Alarm Alerter (>80% CPU)       |    | (Movie Posters & Assets)      |   |
|       +----------------------------------+    +-------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Day-by-Day Implementation Progress & Screenshots Guide

### Day 1 – Project Setup & Repository Strategy
- **Actions Taken**:
  - Initialized repository structure with `/backend`, `/frontend`, `/docker`, `/jenkins`, `/terraform`, `/postman`, and `/docs`.
  - Configured GitFlow branching model (`main`, `dev`, `feature/*`).
  - Created master `README.md` with complete documentation.
- **Commands Executed**:
  ```bash
  git init
  git checkout -b main
  git checkout -b dev
  git commit -m "Day 1: Initialized project architecture, branching, and master README"
  ```
- **Screenshot Placeholder**: *Attach screenshot of GitHub repository page showing branches (`main`, `dev`), directory tree, and initial commit log.*

---

### Day 2 – Backend Microservice & API Testing
- **Actions Taken**:
  - Built RESTful Express server (`server.js`) providing authentication, movie search, ratings, and Cosine Similarity recommendation calculation.
  - Exported Postman test collection `postman/movie_app_postman_collection.json`.
- **API Test Verification**:
  - `GET /health` -> `200 OK`
  - `POST /api/auth/login` -> `200 OK` (Returns JWT token)
  - `GET /api/recommendations?movieId=m1` -> Returns match percentage array.
- **Commands Executed**:
  ```bash
  cd backend
  npm install
  npm test
  npm start
  ```
- **Screenshot Placeholder**: *Attach screenshot of Postman showing 200 OK response for `/api/recommendations` and `/api/movies` endpoints.*

---

### Day 3 – Dynamic Frontend Development
- **Actions Taken**:
  - Developed modern dark-mode Glassmorphism Single-Page Application (SPA).
  - Integrated real-time movie search, genre filtering pills, star rating modal, and cosine match badges.
- **Screenshot Placeholder**: *Attach screenshot of browser displaying CineMatch UI with movie cards, match badges, and rating modal.*

---

### Day 4 – Microservice Containerization (Docker)
- **Actions Taken**:
  - Created optimized multi-stage `Dockerfile` for backend and Nginx reverse-proxy `Dockerfile` for frontend.
  - Configured `docker-compose.yml` for unified execution.
  - Tagged and pushed images to DockerHub.
- **Commands Executed**:
  ```bash
  docker-compose up --build -d
  docker ps
  docker tag cinematch-backend:latest yuvas/cinematch-backend:v1.0
  docker push yuvas/cinematch-backend:v1.0
  ```
- **Screenshot Placeholder**: *Attach screenshot of `docker ps` output in terminal and DockerHub repository page showing pushed images.*

---

### Day 5 – Automated CI/CD Pipeline (Jenkins, SonarQube, Trivy)
- **Actions Taken**:
  - Configured declarative 8-stage `Jenkinsfile`.
  - Integrated SonarQube static code scanner (Quality Gate passed).
  - Executed Trivy container vulnerability scanner before pushing to DockerHub.
- **Screenshot Placeholder**: *Attach screenshot of Jenkins Pipeline stage view showing green checks, SonarQube quality gate dashboard, and Trivy scan log.*

---

### Day 6 – Infrastructure as Code (Terraform)
- **Actions Taken**:
  - Authored Terraform modules (`vpc.tf`, `security_groups.tf`, `ec2.tf`, `s3.tf`, `outputs.tf`).
  - Provisioned AWS VPC, Public Subnet, Internet Gateway, Security Group (ports 22, 80, 3000, 8080), and EC2 instance.
- **Commands Executed**:
  ```bash
  cd terraform
  terraform init
  terraform plan
  terraform apply -auto-approve
  ```
- **Screenshot Placeholder**: *Attach screenshot of `terraform apply` output displaying EC2 Public IP and AWS EC2 Console showing running instance.*

---

### Day 7 – Remote Deployment on AWS EC2
- **Actions Taken**:
  - Connected to EC2 instance via SSH.
  - Verified automated user-data script installed Docker and executed container stack.
- **Commands Executed**:
  ```bash
  ssh -i cinematch-ec2-key.pem ubuntu@<EC2_PUBLIC_IP>
  docker ps
  curl http://localhost:3000/health
  ```
- **Screenshot Placeholder**: *Attach screenshot of EC2 SSH terminal running `docker ps` and browser opening application at `http://<EC2_PUBLIC_IP>`.*

---

### Day 8 – Amazon S3 Integration for Media Storage
- **Actions Taken**:
  - Created S3 bucket `cinematch-movie-posters-bucket-2026` with CORS configuration.
  - Integrated Express API route `/api/upload/poster` generating presigned AWS S3 upload URLs.
- **Screenshot Placeholder**: *Attach screenshot of AWS S3 console showing uploaded poster files and application rendering S3 poster assets.*

---

### Day 9 – Observability, CloudWatch Metrics & Alarms
- **Actions Taken**:
  - Installed and configured CloudWatch Agent (`docs/cloudwatch-config.json`).
  - Configured CloudWatch metrics for CPU utilization and RAM usage.
  - Created alarm `CPU_Utilization_Over_80` notifying via SNS.
- **Screenshot Placeholder**: *Attach screenshot of AWS CloudWatch Dashboard showing CPU/Memory graph and active alarm rule.*

---

### Day 10 – Final Submission & Demo Video
- **Actions Taken**:
  - Compiled comprehensive documentation, architecture diagram, Postman collection, Terraform scripts, and presentation script (`docs/DEMO_VIDEO_SCRIPT.md`).
- **Screenshot Placeholder**: *Attach screenshot of architecture diagram, live deployment link, and final project repository.*

---

## 3. Conclusion & Key Takeaways
Project 7 successfully demonstrates a production-grade DevOps lifecycle. By combining modern microservices design with automated CI/CD security scanning, Infrastructure-as-Code provisioning, and cloud observability, CineMatch provides a scalable, resilient movie recommendation system ready for production deployment.
