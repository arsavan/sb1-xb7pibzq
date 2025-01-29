# CraqueTonBudget

CraqueTonBudget is a modern web application for finding and sharing the best deals and discounts. Built with React, TypeScript, and Supabase, it offers a seamless experience for both users and administrators.

## Features

### For Users
- 🔍 Search and filter products by categories and price ranges
- ❤️ Save favorite products
- 👤 User authentication and profile management
- 📱 Responsive design for all devices
- 🏷️ Real-time price tracking and discount notifications

### For Administrators
- 📊 Complete product management dashboard
- 🏷️ Tag management system
- 🎨 Theme customization
- ⚙️ Site settings management
- 📝 Rich text editor for product descriptions
- 📸 Image upload and management

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - TipTap Editor
  - React Router DOM
  - React Helmet Async

- **Backend:**
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/craquetabudget.git
   cd craquetabudget
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The application uses Supabase as its database. The schema includes:

- Products table
- User roles
- Favorites
- Theme settings
- Storage buckets for images

All necessary migrations are included in the `supabase/migrations` directory.

## Project Structure

```
craquetabudget/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/           # Utility libraries
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
├── public/            # Static assets
└── supabase/
    └── migrations/    # Database migrations
```

## Key Features Implementation

### Authentication

The application uses Supabase Authentication with:
- Email/password authentication
- Protected routes
- Role-based access control (User/Admin)

### Product Management

Administrators can:
- Add/edit/delete products
- Manage product categories (tags)
- Upload product images
- Set prices and discounts
- Create rich text descriptions

### Theme Customization

The application supports dynamic theming with:
- Custom color schemes
- Site title configuration
- Responsive design
- Dark/light mode support

## SEO Optimization

The application includes:
- Dynamic meta tags
- OpenGraph tags
- Twitter cards
- Structured data
- Sitemap generation
- Robots.txt configuration

## Security

- Row Level Security (RLS) policies
- Protected API endpoints
- Secure file uploads
- Role-based access control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.