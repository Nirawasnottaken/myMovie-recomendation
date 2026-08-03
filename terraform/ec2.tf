# Day 6 & 7: AWS EC2 Instance Provisioning with Docker User-Data Bootstrapping
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.cinematch_sg.id]
  key_name               = var.key_name

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
              sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
              sudo apt-get update -y
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu

              # Pull and run application containers from DockerHub
              sudo docker run -d --name cinematch-backend -p 3000:3000 --restart always yuvas/cinematch-backend:latest
              sudo docker run -d --name cinematch-frontend -p 80:80 --restart always yuvas/cinematch-frontend:latest
              EOF

  tags = {
    Name        = "CineMatch-DevOps-Server"
    Environment = var.environment
    Project     = "MovieRecommendationSystem"
  }
}
