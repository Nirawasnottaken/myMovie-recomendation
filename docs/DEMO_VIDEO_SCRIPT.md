# CineMatch - 5 to 10 Minute Presentation & Demo Video Script

**Project Title**: Movie Recommendation System with Full DevOps Pipeline  
**Target Duration**: 6 - 8 Minutes  
**Presenter**: Student / Individual Project Submission  

---

## 📹 Video Timeline & Script Outline

### 0:00 - 1:00 | Introduction & Project Objectives
- **Visual**: Show Slide 1 or Architecture Diagram in `ARCHITECTURE.md`.
- **Speaker Script**:
  > "Hello everyone! Welcome to the final presentation of Project 7: Movie Recommendation System with a Full DevOps Pipeline, named **CineMatch**.
  > The core objective of this project is to build an end-to-end cloud computing application—starting from full-stack microservices development to containerization, automated CI/CD pipelines, Infrastructure-as-Code with Terraform, AWS EC2 deployment, Amazon S3 poster storage, and CloudWatch telemetry."

---

### 1:00 - 2:30 | Day 1 to Day 3: Application Overview & Live App Walkthrough
- **Visual**: Open Browser at `http://localhost:80` or `http://<EC2_PUBLIC_IP>`.
- **Actions to Demonstrate**:
  1. Show the sleek dark-mode glassmorphism interface.
  2. Perform a live movie search for *"Interstellar"* or *"Sci-Fi"*.
  3. Filter by genre pills (Sci-Fi, Action, Cyberpunk).
  4. Click **"Get Similar Movies"** to demonstrate the Cosine Similarity recommendation algorithm generating match percentage badges.
  5. Click **"Login"**, authenticate with `demo@cinematch.com` / `password123`.
  6. Click **"Rate Movie"**, select 5 stars, submit, and show instant update feedback.
- **Speaker Script**:
  > "As you can see on screen, CineMatch features a modern glassmorphism web interface. Users can search movies in real-time, filter by genre, and rate movies.
  > Under the hood, our Node.js Express backend computes content-based similarity scores using genre vectors and metadata tags, calculating instant match percentages for each recommendation."

---

### 2:30 - 3:45 | Day 4: Dockerization & DockerHub
- **Visual**: Switch to Terminal. Run `docker ps` and show DockerHub repository in browser.
- **Actions to Demonstrate**:
  1. Run `docker-compose ps` showing `cinematch-backend` (port 3000) and `cinematch-frontend` (port 80) running cleanly.
  2. Show `backend/Dockerfile` and `frontend/Dockerfile`.
  3. Show pushed image tags on DockerHub (`yuvas/cinematch-backend` and `yuvas/cinematch-frontend`).
- **Speaker Script**:
  > "For containerization, both frontend and backend are packaged into lightweight Docker containers using multi-stage builds. Docker Compose orchestrates the microservices bridge network."

---

### 3:45 - 5:15 | Day 5: Jenkins CI/CD Pipeline, SonarQube & Trivy
- **Visual**: Show Jenkins Web UI Dashboard (`http://localhost:8080` or Jenkins Pipeline execution graph).
- **Actions to Demonstrate**:
  1. Highlight the 8 pipeline stages: Source Checkout, Unit Testing, SonarQube Code Quality Analysis, Quality Gate Verification, Docker Image Build, Trivy Vulnerability Scan, DockerHub Push, and EC2 SSH Deployment.
  2. Show SonarQube Quality Gate result: 0 Bugs, 0 Vulnerabilities.
  3. Show Trivy scan output passing security compliance.
- **Speaker Script**:
  > "Our Jenkins CI/CD pipeline triggers automatically via GitHub webhooks. It executes backend unit tests, performs static code analysis via SonarQube to ensure high code quality, scans container images for security vulnerabilities using Trivy, pushes passed images to DockerHub, and triggers zero-downtime deployment."

---

### 5:15 - 6:30 | Day 6 & 7: Terraform Infrastructure & AWS EC2 Deployment
- **Visual**: Open Terminal in `terraform/` directory. Run `terraform output`. Open AWS Console showing EC2 Instance.
- **Actions to Demonstrate**:
  1. Show `main.tf` / `ec2.tf` / `vpc.tf` provisioned via Terraform.
  2. Show the AWS EC2 instance running in public subnet with Security Group inbound rules (ports 22, 80, 3000, 8080).
  3. Show live EC2 public IP responding in browser.
- **Speaker Script**:
  > "Rather than manually creating cloud resources, we automated our infrastructure using Terraform. Terraform provisions a custom VPC, Public Subnet, Internet Gateway, Security Group, and EC2 instance bootstrapped with Docker."

---

### 6:30 - 7:30 | Day 8 & 9: Amazon S3 Integration & CloudWatch Monitoring
- **Visual**: Show AWS S3 Console bucket (`cinematch-movie-posters-bucket`) and CloudWatch Dashboard.
- **Actions to Demonstrate**:
  1. Show S3 bucket storing high-res movie posters with CORS policy configured.
  2. Show CloudWatch metrics (CPU Utilization graph, Memory usage) and configured Alarm (`CPU_Utilization_Over_80`).
- **Speaker Script**:
  > "For media storage, we integrated Amazon S3 to serve high-definition poster assets. Lastly, Amazon CloudWatch tracks operational telemetry, system logs, and triggers automated email/SMS alarms if CPU utilization exceeds 80%."

---

### 7:30 - 8:00 | Conclusion
- **Speaker Script**:
  > "In summary, CineMatch demonstrates a complete DevOps ecosystem—from code commit to automated testing, container security, cloud infrastructure provisioning, deployment, and monitoring. Thank you!"
