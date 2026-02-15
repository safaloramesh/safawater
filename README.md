# Safa Water Management System

A professional water selling web application for Safa Water with 4-pump tracking, customer tier pricing, and thermal receipt generation.

## Features
- **4-Pump Metering**: Track beginning and ending readings for 4 separate pumps.
- **Custom Customer Pricing**: Admin panel to manage unique rates for General, Small, and Large distribution tiers.
- **BHD Support**: Specialized for Bahraini Dinars with 3-decimal place accuracy.
- **Advanced Invoicing**: 80mm thermal receipt printing with detailed meter proofing.
- **Reports**: Filterable sales and pump reports with CSV/Excel and PDF export.
- **Admin Panel**: Role-based access control for users, prices, and customer profiles.

## Docker Deployment

The application is containerized for easy deployment on any server.

### 1. Environment Setup
Create a `.env` file in the project root:
```env
API_KEY=your_google_gemini_api_key
```

### 2. Launch the System
```bash
docker-compose up -d --build
```
The application will be accessible at `http://your-server-ip:8080`.

### 3. Update from GitHub (Pull & Deploy)
To deploy the latest changes from your repository:
```bash
git pull origin main
docker-compose up -d --build
```

## Technical Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Bundler**: Vite
- **Server**: Nginx (Alpine)
- **Deployment**: Docker & Docker Compose
