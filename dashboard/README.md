# @cognitivesky/dashboard

This is a Next.js dashboard application designed to provide insights into Bluesky data, including sentiment analysis, topic exploration, hashtag analysis, and timeline analysis. The dashboard features interactive charts and a responsive design suitable for both desktop and mobile devices.

## Features

- Interactive charts (e.g., multi-line time series, word clouds, stacked area charts).
- Sentiment analysis and topic exploration.
- Hashtag and timeline analysis.
- Responsive design with mobile support.

## Project Structure

The project is organized as follows:

- **src/app/**: Contains the main application pages and layouts.
  - `hashtags/`: Page for hashtag analysis.
  - `help/`: Help and documentation page.
  - `sentiment/`: Sentiment analysis page.
  - `timeline/`: Timeline analysis page.
  - `topics/`: Topic exploration page.
- **src/components/**: Reusable components for the dashboard.
  - `charts/`: Chart components for data visualization.
  - `ui/`: UI components like buttons, cards, and tabs.
- **src/hooks/**: Custom React hooks for data fetching and state management.
- **src/lib/**: Utility functions.
- **src/types/**: Type definitions and schemas.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.
