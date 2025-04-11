#!/bin/bash

# Install dependencies
npm install --ignore-optional

# Explicitly install the platform-specific Rollup dependency
npm install @rollup/rollup-linux-x64-gnu@4.9.5

# Build the project
npm run build 