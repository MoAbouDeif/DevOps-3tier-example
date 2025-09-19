variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "cluster_name" {
  type    = string
  default = "eks-cluster"
}

variable "cluster_version" {
  type    = string
  default = "1.32"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
variable "subnets_prefix" {
  type    = number
  default = 24
  validation {
    condition     = var.subnets_prefix > tonumber(split("/", var.vpc_cidr)[1])
    error_message = "subnets_prefix must be greater than the VPC CIDR prefix."
  }
}

variable "public_subnets_count" {
  type    = number
  default = 3
  validation {
    condition     = var.public_subnets_count <= (pow(2, (32 - (tonumber(split("/", var.vpc_cidr)[1])) - (32 - var.subnets_prefix))))
    error_message = "too many public subnets for the given VPC CIDR and subnet prefix."
  }
}

variable "private_subnets_count" {
  type    = number
  default = 6
  validation {
    condition     = var.private_subnets_count <= ((pow(2, (32 - (tonumber(split("/", var.vpc_cidr)[1])) - (32 - var.subnets_prefix)))) - var.public_subnets_count)
    error_message = "too many private subnets for the given VPC CIDR and subnet prefix."
  }
}

variable "tags" {
  type = map(string)
  default = {
    Terraform = "true"
    Project   = "DevOps Example Cluster"
    Owner     = "Mohamed AbouDeif"
    Contact   = "Mohamed.AbouDeif@outlook.com"
  }
}

variable "managed_node_groups" {
  type = map(object({
    ami_type       = string
    instance_types = list(string)
    capacity_type  = string
    desired_size   = number
    min_size       = number
    max_size       = number
    block_device_mappings = map(object({
      device_name = string
      ebs = object({
        delete_on_termination = bool
        encrypted             = bool
        iops                  = number
        throughput            = number
        volume_size           = number
        volume_type           = string
      })
    }))
  }))

  default = {
    "eks_node_group" = {
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["t3a.medium"]
      capacity_type  = "ON_DEMAND"
      desired_size   = 2
      min_size       = 2
      max_size       = 6
      block_device_mappings = {
        root_volume = {
          device_name = "/dev/xvda"
          ebs = {
            delete_on_termination = true
            encrypted             = false
            iops                  = 3000
            throughput            = 125
            volume_size           = 50
            volume_type           = "gp3"
          }
        }
      }
    }
  }
}

