# AuraMenu — Digital Restaurant Menu

**About**

AuraMenu is a modern, feature-rich digital restaurant menu application built with React, Tailwind CSS, and Supabase. It provides real-time ordering, themed menus, waiter calls, and a full admin dashboard.

**Features**

- 🍽️ Interactive digital menu with categories, search, and filters
- 🎨 8 curated themes + custom color theming
- 🛒 Cart with locked orders, special instructions, and UPI payment
- ⏱️ Real-time order timer banners
- 🔔 Waiter call system
- 📱 Fully responsive (360px mobile → desktop)
- 🎯 Admin dashboard with branding, dishes, banners, themes, and more
- 📡 Supabase Realtime for instant updates
- 💳 UPI deep-link payment integration

**Prerequisites**

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create a `.env.local` file and set your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Run the app:** `npm run dev`

**Build for production:** `npm run build`

**Tech Stack**

- React 18 + Vite
- Framer Motion 11
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Storage + Realtime)
- TanStack Query
- Lucide React Icons
