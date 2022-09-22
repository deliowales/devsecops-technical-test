
resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "aws_secretsmanager_secret" "secretmasterDB" {
   name = "Masteraccoundb"
}

resource "aws_secretsmanager_secret_version" "sversion" {
  secret_id = aws_secretsmanager_secret.secretmasterDB.id
  secret_string = <<EOF
   {
    "username": "adminaccount",
    "password": "${random_password.password.result}"
   }
EOF
}

# Importing the AWS secrets created previously using arn.
 
data "aws_secretsmanager_secret" "secretmasterDB" {
  arn = aws_secretsmanager_secret.secretmasterDB.arn
}
 
# Importing the AWS secret version created previously using arn.
 
data "aws_secretsmanager_secret_version" "creds" {
  secret_id = data.aws_secretsmanager_secret.secretmasterDB.arn
}



#I have assumed I have stored secrets in json format
locals {
  db_creds = sensitive(jsondecode(
    data.aws_secretsmanager_secret_version.creds.secret_string
  ))
}


resource "aws_db_instance" "rds" {
  allocated_storage    = var.allocated_storage
  engine               = "mysql"
  engine_version       = var.engine_version
  instance_class       = var.instance_class
  name                 = var.name
  username             = local.db_creds.username
  password             = local.db_creds.password
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
}
