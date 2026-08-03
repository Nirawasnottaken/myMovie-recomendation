# CineMatch - Movie Recommendation System with Full DevOps Pipeline

![Build Status](https://img.shields.io/badge/Jenkins-Passing-brightgreen?style=for-the-badge&logo=jenkins)
![Docker](https://img.shields.io/badge/Dockerized-Yes-blue?style=for-the-badge&logo=docker)
![Terraform](https://img.shields.io/badge/IaC-Terraform-blueviolet?style=for-the-badge&logo=terraform)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20CloudWatch-orange?style=for-the-badge&logo=amazon-aws)

**CineMatch** is a full-stack, AI-powered movie recommendation platform built with Node.js/Express, HTML5/CSS3 dynamic Glassmorphism UI, Docker, Jenkins CI/CD, Terraform Infrastructure-as-Code, and deployed on AWS EC2 with Amazon S3 storage and CloudWatch monitoring.

---

## 🌟 Key Features

- 🎬 **Movie Discovery & Live Search**: Instant filtering by genre, rating, title, and release year.
- 🤖 **Recommendation Engine**: Cosine similarity algorithm calculating user genre preferences & collaborative ratings.
- ⭐ **User Ratings System**: Interactive modal allowing logged-in users to rate movies in real-time.
- 🔐 **JWT Authentication**: Secure user registration & login flow.
- ☁️ **AWS S3 Poster Storage**: Cloud storage integration for high-definition movie media assets.
- 🐳 **Containerized Architecture**: Multi-container setup with Docker & Docker Compose.
- 🚀 **Automated CI/CD Pipeline**: Jenkins declarative pipeline with SonarQube code inspection & Trivy container security scans.
- 🏗️ **Infrastructure as Code**: Terraform scripts for provisioning VPC, Security Groups, EC2, and S3.
- 📊 **CloudWatch Monitoring**: Operational telemetry, log streaming, CPU/memory alarms.

---

## 🏗️ Architecture Overview

```
                          +-------------------+
                          |    User Client    |
                          +---------+---------+
                                    |
                                    v
                     +--------------+--------------+
                     |  AWS Security Group / EC2   |
                     +--------------+--------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------+-----------+                       +-----------+-----------+
|  Frontend Container   |                       |   Backend API Container   |
|   (Nginx / Port 80)   |                       |    (Express / Port 3000)  |
+-----------------------+                       +-----------+-----------+
                                                            |
                                    +-----------------------+-----------------------+
                                    |                                               |
                                    v                                               v
                         +----------+----------+                         +----------+----------+
                         | Local Movie & Rating|                         | AWS S3 Bucket Asset  |
                         |     Data Store      |                         |     Storage          |
                         +---------------------+                         +---------------------+
```

---

## 📁 Repository Structure

```
movie-recommendation-devops/
├── backend/                  # Node.js Express REST API & Recommendation Engine
│   ├── data/                 # Initial JSON dataset (Movies & Ratings)
│   ├── Dockerfile            # Container definition for Backend
│   ├── package.json          # Node dependencies & scripts
│   └── server.js             # API Routes, Auth, & Algorithmic logic
├── frontend/                 # Glassmorphism Single-Page Web Application
│   ├── app.js                # Frontend logic & API Client
│   ├── Dockerfile            # Multi-stage Nginx container
│   ├── index.html            # Core UI structure
│   ├── nginx.conf            # Reverse proxy & static server config
│   └── styles.css            # Dark mode design system
├── docker/                   # Deployment scripts & environment files
├── jenkins/                  # Jenkins Declarative Pipeline
│   └── Jenkinsfile           # 7-stage CI/CD with SonarQube & Trivy
├── terraform/                # Infrastructure as Code (AWS)
│   ├── ec2.tf                # Compute & User Data bootstrapping
│   ├── outputs.tf            # Output IP & connections
│   ├── provider.tf           # AWS Provider configuration
│   ├── s3.tf                 # S3 Bucket & CORS policy
│   ├── security_groups.tf    # Inbound/Outbound firewall rules
│   ├── variables.tf          # Terraform input variables
│   └── vpc.tf                # VPC, Subnet, IGW, Route Tables
├── postman/                  # Postman Collection for Day 2 Testing
│   └── movie_app_postman_collection.json
└── docs/                     # Documentation & Academic Reports
    ├── ARCHITECTURE.md       # High-resolution architectural diagram & details
    ├── DEMO_VIDEO_SCRIPT.md  # 5-10 minute presentation guide & transcript
    └── FINAL_REPORT.md       # Complete 10-day project report with screenshot guides
```

---

## 🌿 Git Branching Strategy

This project follows the GitFlow workflow model:
- `main`: Production-ready releases deployed on AWS EC2.
- `dev`: Integration branch for testing feature merges.
- `feature/*`: Specific feature branches (e.g., `feature/recommendation-engine`, `feature/terraform-aws`).

---

## 🛠️ Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Running Locally with Docker Compose
```bash
# Clone repository
git clone https://github.com/your-username/movie-recommendation-devops.git
cd movie-recommendation-devops

# Spin up backend and frontend containers
docker-compose up --build -d

# Access applications:
# Frontend: http://localhost:80
# Backend API: http://localhost:3000/api/movies
```

---

## 🚀 Infrastructure Deployment with Terraform

```bash
cd terraform

# Initialize Terraform plugins
terraform init

# Plan infrastructure provisioning
terraform plan

# Deploy infrastructure on AWS
terraform apply -auto-approve
```

---

## 📄 License & Submissions
Created for Cloud Computing Project 7. Includes full DevOps implementation artifacts.
