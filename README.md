# Victory Classes Website

A multipage website for Victory Classes coaching center with features for student registration and result management.

## Features

- Home page with image carousel
- Student registration form
- Results management system for teachers
- Responsive design
- Simple JSON-based data storage

## Setup Instructions

1. Install Node.js if you haven't already (https://nodejs.org/)

2. Clone this repository or download the files

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000`

## Deployment to Netlify

1. Create a new repository on GitHub and push your code

2. Sign up for Netlify (https://www.netlify.com/)

3. Click "New site from Git"

4. Choose your GitHub repository

5. Configure the build settings:
   - Build command: `npm install`
   - Publish directory: `.`

6. Click "Deploy site"

## Data Storage

The website uses JSON files for data storage:
- `data/registrations.json`: Stores student registrations
- `data/results.json`: Stores posted results

## Teacher Access

To post results, use the following credentials:
- Password: teacher123

## File Structure

```
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── images/
├── data/
├── index.html
├── register.html
├── results.html
├── server.js
└── package.json
```

## Adding Images

1. Place your images in the `images` directory
2. Update the image paths in `index.html` for the carousel
3. When posting results, use the full URL of the image

## Security Notes

- The current implementation uses a simple password for teacher access
- In a production environment, implement proper authentication
- Consider using a proper database instead of JSON files for data storage 