
###############################################################################
# EKS module
###############################################################################
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = local.cluster_name
  kubernetes_version = var.cluster_version

  addons = {
    coredns = {
      most_recent = true
    }
    eks-pod-identity-agent = {
      most_recent    = true
      before_compute = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent    = true
      before_compute = true
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.aws_ebs_csi_driver_irsa.arn
    }
    aws-efs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.aws_efs_csi_driver_irsa.arn
    }
    # amazon-cloudwatch-observability = {
    #   most_recent = true
    #   service_account_role_arn = module.cloudwatch_agent_irsa.arn
    # }

  }

  endpoint_public_access                   = true
  enable_cluster_creator_admin_permissions = true
  enable_irsa                              = true
  authentication_mode                      = "API_AND_CONFIG_MAP"
  include_oidc_root_ca_thumbprint          = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    for name, node_group in var.managed_node_groups :
    name => {
      ami_type       = node_group.ami_type
      instance_types = node_group.instance_types
      capacity_type  = node_group.capacity_type
      desired_size   = node_group.desired_size
      min_size       = node_group.min_size
      max_size       = node_group.max_size
      block_device_mappings = {
        for vol_name, volume in node_group.block_device_mappings :
        vol_name => {
          device_name = volume.device_name
          ebs = {
            delete_on_termination = volume.ebs.delete_on_termination
            encrypted             = volume.ebs.encrypted
            iops                  = volume.ebs.iops
            throughput            = volume.ebs.throughput
            volume_size           = volume.ebs.volume_size
            volume_type           = volume.ebs.volume_type
          }
        }
      }
    }
  }

  tags = merge(
    local.tags,
    {
      "k8s.io/cluster-autoscaler/${local.cluster_name}" = "owned"
      "k8s.io/cluster-autoscaler/enabled"               = "true"
    }
  )
}

###############################################################################
# aws-ebs-csi-driver IRSA
###############################################################################

module "aws_ebs_csi_driver_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "aws-ebs-csi-driver"

  attach_ebs_csi_policy = true

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "kube-system:ebs-csi-controller-sa",
        "kube-system:ebs-csi-node-sa"
      ]
    }
  }
}

###############################################################################
# aws-efs-csi-driver IRSA
###############################################################################

module "aws_efs_csi_driver_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "aws-efs-csi-driver"

  attach_efs_csi_policy = true

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "kube-system:efs-csi-controller-sa",
        "kube-system:efs-csi-node-sa"
      ]
    }
  }
}

###############################################################################
# amazon-cloudwatch-observability IRSA
###############################################################################
# module "cloudwatch_agent_irsa" {
#   source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
#   version = "~> 6.0"
#   name    = "cloudwatch-agent-irsa"

#   attach_cloudwatch_observability_policy = true

#   oidc_providers = {
#     oidc = {
#       provider_arn = module.eks.oidc_provider_arn
#       namespace_service_accounts = [
#         "amazon-cloudwatch:amazon-cloudwatch-observability-controller-manager",
#         "amazon-cloudwatch:cloudwatch-agent",
#         "amazon-cloudwatch:neuron-monitor-service-acct",
#         "amazon-cloudwatch:dcgm-exporter-service-acct"
#       ]
#     }
#   }

#   tags = local.tags
# }