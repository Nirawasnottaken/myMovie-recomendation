# Day 8: Amazon S3 Bucket Provisioning for Movie Posters & CORS Configuration
resource "aws_s3_bucket" "movie_posters" {
  bucket        = var.s3_bucket_name
  force_destroy = true

  tags = {
    Name        = "CineMatch Poster Storage"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_cors_configuration" "s3_cors" {
  bucket = aws_s3_bucket.movie_posters.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.movie_posters.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
