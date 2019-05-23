# Steps to use terraform

1. Install terraform cli
2. Init using `terraform init`
3. Set AWS credentials
```
$ export AWS_ACCESS_KEY_ID="anaccesskey"
$ export AWS_SECRET_ACCESS_KEY="asecretkey"
$ export AWS_DEFAULT_REGION="us-west-2"
$ terraform plan
```
4. Make changes to files
4. Apply changes using `terraform apply`
