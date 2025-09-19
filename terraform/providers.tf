terraform {
  required_version = "~> 1.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  backend "s3" {
    bucket       = "abodaif-terraform-backend"
    key          = "devops-example/terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
  }
}
provider "aws" {
  region  = var.aws_region
  profile = local.aws_profile
}

provider "helm" {
  kubernetes = {
    depends_on             = [module.eks]
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.token.token
  }
}

