{{/*
Expand the name of the chart for backend.
*/}}
{{- define "..name.backend" -}}
{{- $suffix := default "backend" }}
{{- default .Chart.Name .Values.nameOverride | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- end }}

{{/*
Create a default fully qualified app name for backend.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "..fullname.backend" -}}
{{- if .Values.backend.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 52 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- $suffix := default "backend" }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels for backend
*/}}
{{- define "..labels.backend" -}}
helm.sh/chart: {{ include "..chart" . }}
{{ include "..selectorLabels.backend" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels for backend
*/}}
{{- define "..selectorLabels.backend" -}}
app.kubernetes.io/name: {{ include "..fullname.backend" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
role: backend
{{- end }}

{{/*
Create the name of the service account to use for backend
*/}}
{{- define "..serviceAccountName.backend" -}}
{{- if .Values.backend.serviceAccount.create }}
{{- default (include "..name.backend" .) .Values.backend.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.backend.serviceAccount.name }}
{{- end }}
{{- end }}
