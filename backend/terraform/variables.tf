variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "us-west-2"
}

variable "aws_managed_policies" {
  type    = list(string)
  default = [
    "AmazonRekognitionReadOnlyAccess",
    "AmazonPollyReadOnlyAccess",
    "ComprehendReadOnly",
    "AmazonLexRunBotsOnly",
    "TranslateReadOnly",
    "AmazonS3FullAccess"
  ]
}