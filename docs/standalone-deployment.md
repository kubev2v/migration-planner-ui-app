# Standalone OpenShift Deployment Guide

This guide provides instructions for building and deploying the Migration Planner UI in a standalone OpenShift environment. For the configurable nginx setup (API upstream and base path via environment variables), see [standalone-nginx-configurable-deployment](plans/standalone-nginx-configurable-deployment.md).

**Build and runtime alignment:** The image is built with a specific API base path (`MIGRATION_PLANNER_API_BASE_URL`). When you deploy (OpenShift template or `podman run`), use the same base path at runtime so nginx proxies the path the UI calls. The OpenShift template defaults match the default build; override the template parameters only if you built the image with a different base path.

**Local runs:** `make podman-run` uses default API upstream and base path. To override (e.g. different API host/port), run the container with `-e MIGRATION_PLANNER_API_UPSTREAM=...` and `-e MIGRATION_PLANNER_API_BASE_URL=...`; see the [plan](plans/standalone-nginx-configurable-deployment.md) for the exact variables and examples.

## Prerequisites

Before proceeding, ensure you have the following:

- **OpenShift cluster**: Access to an OpenShift cluster with sufficient permissions
- **OpenShift CLI (oc)**: Installed and configured on your local machine
- **Project context**: You have switched to the required OpenShift project/namespace
- **Cluster credentials**: Properly configured authentication with your OpenShift cluster
- **Migration Planner API**: The migration-planner backend service must be deployed in the same project
  - Follow the deployment instructions: https://github.com/kubev2v/migration-planner/blob/main/doc/deployment.md

## Building and Deploying from Source

### Step 1: Build the Container Image

Build the container image locally using Podman:

```bash
# Build the container image
make podman-build IMAGE=quay.io/your-registry/migration-planner-ui
```

### Step 2: Push to Container Registry

Push the built image to your container registry:

```bash
# Login to your registry (if needed)
make quay-login QUAY_USER=your-quay-user QUAY_TOKEN=your-quay-token

# Push the image
make podman-push IMAGE=quay.io/your-registry/migration-planner-ui
```

### Step 3: Deploy to OpenShift

Deploy the application to your OpenShift cluster:

```bash
# Deploy using the OpenShift template
make deploy-on-openshift IMAGE=quay.io/your-registry/migration-planner-ui
```

The template sets `MIGRATION_PLANNER_API_UPSTREAM` (default `migration-planner-api:3443`) and `MIGRATION_PLANNER_API_BASE_URL` (default `/api/migration-assessment`) so nginx proxies API traffic to the backend. Use the same base path as at build time. To override when processing the template, pass e.g. `-p MIGRATION_PLANNER_API_UPSTREAM=your-api-service:3443`.

### Step 4: Access the Application

Once deployed, get the route URL:

```bash
# Get the route URL
oc get route planner-ui -o jsonpath='{.spec.host}'
```

The application will be accessible at: `https://<route-host>`

## Verification

### Check Deployment Status

```bash
# Check deployment status
oc get deployment migration-planner-ui

# Check pod status
oc get pods -l app=migration-planner-ui

# Check service and route
oc get svc migration-planner-ui
oc get route planner-ui
```

### View Application Logs

```bash
# View logs from the UI pods
oc logs -l app=migration-planner-ui -f
```

## Cleanup

To remove the deployment:

```bash
# Remove using Makefile
make delete-from-openshift IMAGE=quay.io/your-registry/migration-planner-ui
```
