# Container and deployment configuration
DOCKER_CONF ?= $(CURDIR)/docker-config
DOCKER_AUTH_FILE ?= ${DOCKER_CONF}/auth.json
PODMAN ?= podman
IMAGE_TAG ?= $(shell git rev-parse HEAD)
REPLICAS ?= 1

# Container runtime configuration
CONTAINER_NAME ?= migration-planner-ui
CONTAINER_PORT ?= 8080
HOST_PORT ?= 8080
CONTAINERFILE_PATH ?= deploy/dev/Containerfile
CONTAINERIGNORE_PATH ?= deploy/dev/.containerignore

oc: # Verify oc installed, in linux install it if not already installed
ifeq ($(OC_BIN),)
	@if [ "$(OS)" = "darwin" ]; then \
		echo "Error: macOS detected. Please install oc manually from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$(OC_VERSION)/"; \
		exit 1; \
	fi
	@echo "oc not found. Installing for Linux..."
	@curl -sL "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$(OC_VERSION)/openshift-client-linux.tar.gz" | tar -xz
	@chmod +x oc kubectl
	@sudo mv oc kubectl /usr/local/bin/
	@echo "oc installed successfully."
else
	@echo "oc is already installed at $(OC_BIN)"
endif

# Build the standalone application locally
build-standalone:
	@echo "Building standalone application..."
	rm -rf dist-standalone
	npm install
	npm run build:standalone
	@echo "Standalone build completed in dist-standalone/"

# Legacy build target (federated module)
build:
	@echo "Building federated module..."
	rm -rf dist
	npm install
	npm run build
	@echo "Federated build completed in dist/"

# Build the container image
podman-build:
	@echo "Building container image: $(IMAGE):$(IMAGE_TAG)"
	@if [ ! -f "$(CONTAINERFILE_PATH)" ]; then \
		echo "Error: Containerfile not found at $(CONTAINERFILE_PATH)"; \
		exit 1; \
	fi
	$(PODMAN) build . \
		-t $(IMAGE):$(IMAGE_TAG) \
		-f $(CONTAINERFILE_PATH) \
		--ignorefile $(CONTAINERIGNORE_PATH) \
		--arch amd64 \
		--memory=4g \
		--layers \
		--build-arg USE_MIGRATION_PLANNER_API=true
	@echo "Container image built successfully: $(IMAGE):$(IMAGE_TAG)"

# Tag the image as latest
podman-tag-latest:
	$(PODMAN) tag $(IMAGE):$(IMAGE_TAG) $(IMAGE):latest
	@echo "Tagged $(IMAGE):$(IMAGE_TAG) as $(IMAGE):latest"

# Run the container
podman-run:
	@echo "Starting container: $(CONTAINER_NAME)"
	@# Stop and remove existing container if it exists
	-$(PODMAN) stop $(CONTAINER_NAME) 2>/dev/null || true
	-$(PODMAN) rm $(CONTAINER_NAME) 2>/dev/null || true
	@# Check if image exists
	@if ! $(PODMAN) image exists $(IMAGE):$(IMAGE_TAG); then \
		echo "Error: Image $(IMAGE):$(IMAGE_TAG) not found. Run 'make podman-build' first."; \
		exit 1; \
	fi
	@# Check if port is available
	@if netstat -tlnp 2>/dev/null | grep -q ":$(HOST_PORT) "; then \
		echo "Warning: Port $(HOST_PORT) appears to be in use."; \
	fi
	$(PODMAN) run -d \
		--name $(CONTAINER_NAME) \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		$(IMAGE):$(IMAGE_TAG)
	@echo "Container started successfully!"
	@echo "Access the application at: http://localhost:$(HOST_PORT)"
	@echo "Container name: $(CONTAINER_NAME)"

# Stop the container
podman-stop:
	@echo "Stopping container: $(CONTAINER_NAME)"
	-$(PODMAN) stop $(CONTAINER_NAME) 2>/dev/null || true
	-$(PODMAN) rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "Container stopped and removed."

# Show container logs
podman-logs:
	$(PODMAN) logs -f $(CONTAINER_NAME)

# Show container status
podman-status:
	@echo "Container status:"
	$(PODMAN) ps -a --filter "name=$(CONTAINER_NAME)"

# Remove the container image
podman-clean:
	@echo "Removing container image: $(IMAGE):$(IMAGE_TAG)"
	-$(PODMAN) rmi $(IMAGE):$(IMAGE_TAG) 2>/dev/null || true
	-$(PODMAN) rmi $(IMAGE):latest 2>/dev/null || true
	@echo "Container image removed."

# Complete container workflow: build and run
podman-deploy: podman-build podman-run

# Container development workflow: build, tag as latest, and run
podman-dev: podman-build podman-tag-latest podman-run

quay-login:
	@if [ ! -f $(DOCKER_AUTH_FILE) ] && [ $(QUAY_USER) ] && [ $(QUAY_TOKEN) ]; then \
		$(info Create Auth File: $(DOCKER_AUTH_FILE)) \
		mkdir -p "$(DOCKER_CONF)"; \
		$(PODMAN) login --authfile $(DOCKER_AUTH_FILE) -u=$(QUAY_USER) -p=$(QUAY_TOKEN) quay.io; \
	fi;

podman-push:
	@echo "Pushing container image: $(IMAGE):$(IMAGE_TAG)"
	if [ -f $(DOCKER_AUTH_FILE) ]; then \
		$(PODMAN) push --authfile=$(DOCKER_AUTH_FILE) $(IMAGE):$(IMAGE_TAG); \
	else \
		$(PODMAN) push $(IMAGE):$(IMAGE_TAG); \
	fi;
	@echo "Container image pushed successfully."

# OpenShift deployment
deploy-on-openshift:
	@echo "Deploying Migration Planner UI to OpenShift..."
	oc process -f deploy/dev/ui-template.yaml \
		   -p MIGRATION_PLANNER_UI_IMAGE=$(IMAGE) \
		   -p MIGRATION_PLANNER_REPLICAS=$(REPLICAS) \
		   -p IMAGE_TAG=$(IMAGE_TAG) \
		 | oc apply -f -
	@echo "*** Migration Planner UI has been deployed successfully on OpenShift ***"
	@echo "Getting route information..."
	@oc get route planner-ui -o jsonpath='{.spec.host}' 2>/dev/null && echo "" || echo "Route not yet available"

delete-from-openshift:
	@echo "Deleting Migration Planner UI from OpenShift..."
	oc process -f deploy/dev/ui-template.yaml \
		   -p MIGRATION_PLANNER_UI_IMAGE=$(IMAGE) \
		   -p MIGRATION_PLANNER_REPLICAS=$(REPLICAS) \
		   -p IMAGE_TAG=$(IMAGE_TAG) \
		 | oc delete -f -
	@echo "*** Migration Planner UI has been deleted successfully from OpenShift ***"

# Help target
help:
	@echo "Migration Planner UI - Available Make targets:"
	@echo ""
	@echo "Local Development:"
	@echo "  build-standalone     Build the standalone application locally"
	@echo "  build               Build the federated module locally"
	@echo ""
	@echo "Container Management:"
	@echo "  podman-build        Build the container image"
	@echo "  podman-run          Run the container"
	@echo "  podman-stop         Stop and remove the container"
	@echo "  podman-logs         Show container logs"
	@echo "  podman-status       Show container status"
	@echo "  podman-clean        Remove container images"
	@echo "  podman-deploy       Build and run container (build + run)"
	@echo "  podman-dev          Development workflow (build + tag latest + run)"
	@echo ""
	@echo "Container Registry:"
	@echo "  quay-login          Login to Quay.io registry"
	@echo "  podman-push         Push container image to registry"
	@echo ""
	@echo "OpenShift Deployment:"
	@echo "  deploy-on-openshift Deploy application on OpenShift"
	@echo "  delete-from-openshift Remove application from OpenShift"
	@echo ""
	@echo "Configuration Variables:"
	@echo "  IMAGE=$(IMAGE)"
	@echo "  IMAGE_TAG=$(IMAGE_TAG)"
	@echo "  CONTAINER_NAME=$(CONTAINER_NAME)"
	@echo "  HOST_PORT=$(HOST_PORT)"
	@echo "  CONTAINER_PORT=$(CONTAINER_PORT)"

.PHONY: oc build-standalone build podman-build podman-tag-latest podman-run podman-stop podman-logs podman-status podman-clean podman-deploy podman-dev quay-login podman-push deploy-on-openshift delete-from-openshift help

# Default target
.DEFAULT_GOAL := help

