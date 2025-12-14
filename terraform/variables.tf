variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "asia-northeast3"
}

variable "database_id" {
  description = "The Firestore Database ID"
  type        = string
  default     = "(default)"
}
