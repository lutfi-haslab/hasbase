# Project Hasbase 

## Overview
This project utilizes Vite, Tauri, and Bun for development and building across multiple platforms, including web, mobile, and desktop.

## Prerequisites
Before setting up the project, ensure you have the following installed:

### Install Rust
1. Install Rust using [rustup](https://rustup.rs/):
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. Restart your terminal and verify the installation:
   ```sh
   rustc --version
   ```

### Install Bun
1. Install Bun via the official script:
   ```sh
   curl -fsSL https://bun.sh/install | bash
   ```
2. Restart your terminal and verify the installation:
   ```sh
   bun --version
   ```

### Install Tauri CLI
1. Install Tauri CLI globally:
   ```sh
   cargo install tauri-cli
   ```

## Installation
1. Clone the repository:
   ```sh
   git clone <repo_url>
   cd <repo_name>
   ```
2. Install dependencies:
   ```sh
   bun install
   ```

## Available Scripts
The following scripts are available in `package.json`:

### Development
- **Start Vite development server:**
  ```sh
  bun run dev
  ```
- **Start web development with environment config:**
  ```sh
  bun run dev:web
  ```
- **Start mobile development with environment config:**
  ```sh
  bun run dev:mobile
  ```

### Linting
- **Run ESLint:**
  ```sh
  bun run lint
  ```

### Build
- **Build the project:**
  ```sh
  bun run build
  ```
- **Build and package Tauri application:**
  ```sh
  bun run build:tauri
  ```
- **Build sidecar binaries:**
  ```sh
  bun run build:sidecar-winos
  bun run build:sidecar-macos
  bun run build:sidecar-linux
  ```

### Tauri
- **Run Tauri application in development mode:**
  ```sh
  bun run tauri:dev
  ```
- **Run Tauri Android development:**
  ```sh
  bun run tauri:android:dev
  ```
- **Build Tauri Android APK:**
  ```sh
  bun run tauri:android:build
  ```
- **Run Tauri iOS development:**
  ```sh
  bun run tauri:ios:dev
  ```

### API & Server
- **Start backend API in watch mode:**
  ```sh
  bun run dev:api
  ```
- **Start Bun server:**
  ```sh
  bun run server
  ```

### Icons
- **Generate icons for Tauri:**
  ```sh
  bun run build:icons
  ```

## Notes
- Ensure `rustup`, `bun`, and `tauri-cli` are installed correctly before running the scripts.
- Use the appropriate script depending on the platform you are targeting.

## License
This project is licensed under [MIT License](LICENSE).

