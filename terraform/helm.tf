###############################################################################
# external-dns IRSA
###############################################################################

module "external_dns_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "external-dns"

  attach_external_dns_policy    = true
  external_dns_hosted_zone_arns = [data.aws_route53_zone.selected.arn]

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "external-dns:external-dns"
      ]
    }
  }

  tags = local.tags
}

resource "helm_release" "external_dns" {
  chart = "external-dns"
  name  = "external-dns"

  lint       = true
  repository = "https://kubernetes-sigs.github.io/external-dns"
  version    = "1.18.0"

  namespace        = "external-dns"
  create_namespace = true
  wait             = true

  depends_on = [
    module.eks
  ]

  set = [
    {
      name  = "serviceAccount.create"
      value = "true"
    },
    {
      name  = "serviceAccount.name"
      value = "external-dns"
    },
    {
      name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
      value = "${module.external_dns_irsa.arn}"
    }
  ]
}

###############################################################################
# cert-manager and IRSA
###############################################################################

module "cert_manager_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "cert-manager"

  attach_cert_manager_policy    = true
  cert_manager_hosted_zone_arns = [data.aws_route53_zone.selected.arn]

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "cert-manager:cert-manager",
        "cert-manager:cert-manager-cainjector",
        "cert-manager:cert-manager-webhook"
      ]
    }
  }

  tags = local.tags
}

resource "helm_release" "cert_manager_controller" {
  chart = "cert-manager"
  name  = "cert-manager"

  lint       = true
  repository = "https://charts.jetstack.io"
  version    = "1.18.2"

  namespace        = "cert-manager"
  create_namespace = true
  wait             = true

  depends_on = [
    module.cert_manager_irsa,
    module.eks
  ]

  set = [
    {
      name  = "serviceAccount.create"
      value = "true"
    },
    {
      name  = "cainjector.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
      value = "${module.cert_manager_irsa.arn}"
    },
    {
      name  = "installCRDs"
      value = "true"
    },
  ]
}

###############################################################################
# aws-load-balancer-controller with IRSA
###############################################################################

module "aws_load_balancer_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "aws-load-balancer-controller"

  attach_load_balancer_controller_policy = true

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "aws-load-balancer-controller:aws-load-balancer-controller"
      ]
    }
  }
}

resource "helm_release" "aws_load_balancer_controller" {
  chart = "aws-load-balancer-controller"
  name  = "aws-load-balancer-controller"

  repository = "https://aws.github.io/eks-charts"
  version    = "1.13.4"
  lint       = true

  create_namespace = true
  namespace        = "aws-load-balancer-controller"
  wait             = true

  depends_on = [
    module.aws_load_balancer_controller_irsa,
    module.eks,
    helm_release.cert_manager_controller
  ]
  set = [
    {
      name  = "serviceAccount.create"
      value = "true"
    },
    {
      name  = "serviceAccount.name"
      value = "aws-load-balancer-controller"
    },
    {
      name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
      value = "${module.aws_load_balancer_controller_irsa.arn}"
    },
    {
      name  = "vpcId"
      value = module.vpc.vpc_id
    },
    {
      name  = "region"
      value = var.aws_region
    },
    {
      name  = "clusterName"
      value = module.eks.cluster_name
    },
    {
      name  = "replicaCount"
      value = "2"
    },
    {
      name  = "enableCertManager"
      value = true
    },
    {
      name  = "clusterSecretsPermissions.allowAllSecrets"
      value = true
    },
    {
      name: "enableServiceSGTags"
      value: true
    }
  ]
}

###############################################################################
# cluster autoscaler 
###############################################################################

module "cluster_autoscaler_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts"
  version = "~> 6.0"
  name    = "cluster-autoscaler"

attach_cluster_autoscaler_policy = true
cluster_autoscaler_cluster_names = ["${module.eks.cluster_name}"]

  oidc_providers = {
    oidc = {
      provider_arn = module.eks.oidc_provider_arn
      namespace_service_accounts = [
        "kube-system:cluster-autoscaler"
      ]
    }
  }

  tags = local.tags

}

resource "helm_release" "autoscaler" {
  chart = "cluster-autoscaler"
  name  = "cluster-autoscaler"

  repository = "https://kubernetes.github.io/autoscaler"
  version    = "9.50.1"
  lint       = true

  create_namespace = true
  namespace        = "kube-system"
  wait             = true

  depends_on = [
    module.eks,
    module.cluster_autoscaler_irsa
  ]
  set = [
    {
      name  = "autoDiscovery.clusterName"
      value = module.eks.cluster_name
    },
    {
      name  = "awsRegion"
      value = var.aws_region
    },
    {
      name  = "rbac.serviceAccount.name"
      value = "cluster-autoscaler"
    },
    {
      name  = "rbac.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
      value = "${module.cluster_autoscaler_irsa.arn}"
    },
    {
      name  = "extraArgs.balance-similar-node-groups"
      value = "true"
    },
    {
      name  = "extraArgs.scale-down-unneeded-time"
      value = "10m"
    },
    {
      name  = "extraArgs.scale-down-utilization-threshold"
      value = "0.5"
    },
    {
      name  = "extraArgs.expander"
      value = "least-waste"
    },
  ]
}

###############################################################################
# metrics server 
###############################################################################

resource "helm_release" "metrics_server" {
  chart = "metrics-server"
  name  = "metrics-server"

  repository = "https://kubernetes-sigs.github.io/metrics-server"
  version    = "3.13.0"
  lint       = true

  create_namespace = true
  namespace        = "metrics-server"
  wait             = true

  depends_on = [
    module.eks
  ]

  set = [
    {
      name  = "serviceAccount.create"
      value = true
    },
    {
      name  = "rbac.create"
      value = true
    },
  ]
}