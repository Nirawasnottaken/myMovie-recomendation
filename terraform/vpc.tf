# Day 6: VPC, Public Subnet, Internet Gateway & Route Tables
resource "aws_vpc" "cinematch_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "cinematch-vpc"
    Environment = var.environment
    Project     = "MovieRecommendationSystem"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.cinematch_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "cinematch-public-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.cinematch_vpc.id

  tags = {
    Name = "cinematch-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.cinematch_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "cinematch-public-route-table"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}
