{{/*
Expand the name of the chart for frontend.
*/}}
{{- define "..name.frontend" -}}
{{- $suffix := default "frontend" }}
{{- default .Chart.Name .Values.nameOverride | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- end }}

{{/*
Create a default fully qualified app name for frontend.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "..fullname.frontend" -}}
{{- if .Values.frontend.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 52 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- $suffix := default "frontend" }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 52 | trimSuffix "-" }}-{{ $suffix }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels for frontend
*/}}
{{- define "..labels.frontend" -}}
helm.sh/chart: {{ include "..chart" . }}
{{ include "..selectorLabels.frontend" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels for frontend
*/}}
{{- define "..selectorLabels.frontend" -}}
app.kubernetes.io/name: {{ include "..fullname.frontend" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use for frontend
*/}}
{{- define "..serviceAccountName.frontend" -}}
{{- if .Values.frontend.serviceAccount.create }}
{{- default (include "..name.frontend" .) .Values.frontend.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.frontend.serviceAccount.name }}
{{- end }}
{{- end }}
