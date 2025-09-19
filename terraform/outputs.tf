output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "region" {
  value = var.aws_region
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "aws_load_balancer_controller_irsa_arn" {
  value = module.aws_load_balancer_controller_irsa.arn
}
