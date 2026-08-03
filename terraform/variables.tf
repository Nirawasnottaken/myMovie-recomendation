variable "aws_region" {
  description = "AWS region for provisioning infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "AWS EC2 SSH Key Pair Name"
  type        = string
  default     = "cinematch-ec2-key"
}

variable "s3_bucket_name" {
  description = "Amazon S3 Bucket Name for Movie Poster Assets"
  type        = string
  default     = "cinematch-movie-posters-bucket-2026"
}
