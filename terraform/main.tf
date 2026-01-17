terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
    }
}

provider "aws" {
    region = "us-east-1"
}

# VPC
resource "aws_vpc" "main" {
    cidr_block           = "10.0.0.0/16"
    enable_dns_hostnames = true

    tags = {
        Name = "main-vpc"
    }
}

# Subnet
resource "aws_subnet" "main" {
    vpc_id            = aws_vpc.main.id
    cidr_block        = "10.0.1.0/24"
    availability_zone = "us-east-1a"

    tags = {
        Name = "main-subnet"
    }
}

# Security Group with intentional vulnerability (SSH open to 0.0.0.0/0)
resource "aws_security_group" "allow_all_ssh" {
    name        = "allow-all-ssh"
    description = "Security group with open SSH"
    vpc_id      = aws_vpc.main.id

    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "allow-all-ssh"
    }
}

# EC2 Instance with unencrypted root volume
resource "aws_instance" "web_server" {
    ami                    = "ami-0c55b159cbfafe1f0"
    instance_type          = "t2.micro"
    subnet_id              = aws_subnet.main.id
    vpc_security_group_ids = [aws_security_group.allow_all_ssh.id]
    associate_public_ip_address = true

    root_block_device {
        volume_type           = "gp2"
        volume_size           = 20
        delete_on_termination = true
        encrypted             = false
    }

    tags = {
        Name = "web-server"
    }
}

output "instance_public_ip" {
    value = aws_instance.web_server.public_ip
}