output "ec2_public_ip" {
  description = "Public IP address of the deployed AWS EC2 server"
  value       = aws_instance.app_server.public_ip
}

output "application_url" {
  description = "Public URL to access CineMatch frontend application"
  value       = "http://${aws_instance.app_server.public_ip}"
}

output "backend_api_url" {
  description = "Public URL for Express Backend REST API"
  value       = "http://${aws_instance.app_server.public_ip}:3000/api/movies"
}

output "s3_bucket_name" {
  description = "Name of created Amazon S3 Bucket for posters"
  value       = aws_s3_bucket.movie_posters.bucket
}

output "ssh_connection_command" {
  description = "Command to SSH into EC2 instance"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.app_server.public_ip}"
}
