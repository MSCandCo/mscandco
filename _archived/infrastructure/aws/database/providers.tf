provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# Configure the AWS Provider for the required region
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "us_west_2"
  region = "us-west-2"
}

provider "aws" {
  alias  = "eu_west_1"
  region = "eu-west-1"
} 