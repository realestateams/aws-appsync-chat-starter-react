provider "aws" {
  region = "${var.aws_region}"
}

data "aws_iam_policy" "aws_managed_policies_arn" {
  count      = "${length(var.aws_managed_policies)}"
  arn = "arn:aws:iam::aws:policy/${var.aws_managed_policies[count.index]}"
}


resource "aws_iam_role" "appsync_backend_role" {
  name = "appsync_backend_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "appsync.amazonaws.com",
          "lambda.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = {
    "used-for" = "appsync-deploy"
  }
}

resource "aws_iam_role_policy_attachment" "aws_managed_policies_attach" {
  role       = "${aws_iam_role.appsync_backend_role.name}"
  count      = "${length(var.aws_managed_policies)}"
  policy_arn = "${data.aws_iam_policy.aws_managed_policies_arn[count.index].arn}"
}