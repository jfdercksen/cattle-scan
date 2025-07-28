# Technology Stack

## Core Technologies

### Frontend Framework
- **React 18** with TypeScript for type-safe component development
- **Functional Components**: Exclusively using function components with hooks
- **JSX/TSX**: TypeScript JSX for all component files
- **Strict Mode**: React StrictMode enabled for development

### Build System & Development
- **Vite 5.4+** with SWC for ultra-fast compilation and hot module replacement
- **TypeScript 5.5+** with project references for modular compilation
- **ESM Modules**: Full ES module support with `"type": "module"` in package.json
- **Development Server**: Configured to run on port 8080 with IPv6 support

### Styling & UI Framework
- **Tailwind CSS 3.4+** for utility-first styling
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **CSS Variables**: Custom properties for theme colors and spacing
- **Dark Mode**: Class-based dark mode with next-themes
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### State Management & Data Fetching
- **TanStack Query (React Query) 5.56+**: Server state management, caching, and synchronization
- **React Context**: Local state management for auth and global app state
- **React Hook Form 7.53+**: Form state management with minimal re-renders
- **Zod 3.23+**: Runtime type validation and schema definition

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Supabase Auth**: Authentication and user management
- **Row Level Security (RLS)**: Database-level security policies with multi-tenant isolation
- **Real-time Subscriptions**: Live data updates via Supabase realtime
- **Auto-generated Types**: TypeScript types generated from database schema
- **Multi-Tenant Architecture**: Company-based data isolation with cross-company user relationships
- **Supabase Storage**: Secure file storage with role-based access policies

### Routing & Navigation
- **React Router DOM 6.26+**: Client-side routing with nested routes
- **Layout Components**: Shared layouts with Outlet components
- **Protected Routes**: Authentication-based route protection
- **Role-based Routing**: Dynamic routing based on user roles

### Internationalization & Localization
- **Language Support**: English and Afrikaans for South African market
- **Language Switching**: Header-based language toggle (EN/AF buttons)
- **State Management**: Language preference stored in React state (currently local)
- **Persistence**: Language preference should be stored in user profile or localStorage
- **Implementation Status**: Basic UI implemented, full i18n system needs implementation
- **Future Enhancement**: Consider react-i18next or similar library for comprehensive i18n

## Key Libraries & Dependencies

### UI Components & Primitives
- **Radix UI**: Unstyled, accessible UI primitives
  - `@radix-ui/react-*`: Complete set of form controls, overlays, and navigation
- **Lucide React 0.462+**: Consistent icon library with 1000+ icons
- **class-variance-authority**: Type-safe component variants
- **clsx + tailwind-merge**: Conditional className utilities

### Form Handling & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Zod integration for form validation
- **Zod**: Schema validation with TypeScript inference
- **Input Components**: Custom form controls with validation states

### Date & Time
- **date-fns 3.6+**: Lightweight date utility library
- **react-day-picker 8.10+**: Accessible date picker component
- **Timezone Support**: UTC handling with local display

### Charts & Data Visualization
- **Recharts 2.12+**: React charting library built on D3
- **Responsive Charts**: Auto-sizing charts with Tailwind integration
- **Custom Themes**: Chart theming that matches application design

### Specialized Components
- **react-signature-canvas**: Digital signature capture with mobile touch calibration
- **embla-carousel-react**: Touch-friendly carousel component
- **react-resizable-panels**: Resizable layout panels
- **cmdk**: Command palette and search interface

### File Upload & Storage
- **Supabase Storage**: Secure file storage with bucket-based organization
- **File Upload Manager**: Custom component for brand photos, vet letterheads, and affidavits
- **Camera Integration**: Mobile camera capture for document uploads
- **File Type Validation**: Strict validation for security and compliance

### Internationalization Libraries (Recommended)
- **react-i18next**: Comprehensive i18n framework for React applications
- **i18next**: Core internationalization framework with namespace support
- **i18next-browser-languagedetector**: Automatic language detection
- **date-fns/locale**: Localized date formatting for en-ZA and af-ZA locales

### Notifications & Feedback
- **Sonner**: Modern toast notifications
- **React Hot Toast**: Alternative toast system
- **Loading States**: Skeleton components and loading indicators

### Development & Quality Tools
- **ESLint 9.9+**: Code linting with TypeScript support
- **TypeScript ESLint**: TypeScript-specific linting rules
- **React Hooks ESLint**: Hooks rules enforcement
- **React Refresh**: Fast refresh for development

## Development Workflow

### Common Commands
```bash
# Development
npm run dev                    # Start dev server on localhost:8080
npm run build                  # Production build with optimizations
npm run build:dev             # Development build without minification
npm run preview               # Preview production build locally
npm run lint                  # Run ESLint on all TypeScript files

# Database & Types
npm run supabase:generate-types  # Generate types from Supabase schema
supabase start                   # Start local Supabase instance
supabase db reset               # Reset local database
supabase db push                # Push schema changes
```

### Environment Setup
```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional development variables
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

## Configuration Details

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,        // Relaxed for rapid development
    "noUnusedParameters": false,   // Allows unused parameters
    "skipLibCheck": true,          // Skip lib type checking
    "allowJs": true,               // Allow JS files
    "noUnusedLocals": false,       // Allow unused variables
    "strictNullChecks": false      // Relaxed null checking
  }
}
```

### Vite Configuration
- **Plugins**: React SWC, Lovable component tagger (dev only)
- **Aliases**: `@` resolves to `./src`
- **Server**: IPv6 support, port 8080
- **Build**: Optimized for production with code splitting

### Tailwind Configuration
- **Dark Mode**: Class-based strategy
- **Content**: Scans all TypeScript/JSX files
- **Theme Extensions**: Custom colors, animations, and utilities
- **Plugins**: tailwindcss-animate for smooth animations

### ESLint Configuration
- **Parser**: TypeScript ESLint parser
- **Extends**: Recommended configs for JS, TS, React
- **Rules**: React Hooks rules, React Refresh rules
- **Overrides**: Disabled unused vars rule for development speed

## Architecture Patterns

### Component Patterns
- **Compound Components**: Complex components with sub-components
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable stateful logic
- **Higher-Order Components**: Cross-cutting concerns (rare usage)
- **Modular Field Visibility**: Dynamic field showing/hiding based on feature flags

### State Management Patterns
- **Server State**: TanStack Query for all API interactions
- **Client State**: React Context for global app state
- **Form State**: React Hook Form for complex forms with state locking
- **URL State**: React Router for navigation state
- **Multi-Tenant State**: Company context switching for users with multiple relationships

### Data Flow Patterns
- **Unidirectional Data Flow**: Props down, events up
- **Optimistic Updates**: Immediate UI updates with rollback
- **Background Sync**: Automatic data synchronization
- **Error Boundaries**: Graceful error handling
- **Form State Locking**: Workflow-based form section locking

### Authentication Patterns
- **Context Provider**: Auth state management
- **Protected Routes**: Route-level authentication
- **Role-based Access**: Component-level permission checks
- **Session Management**: Automatic token refresh
- **Multi-Tenant Access Control**: Company-based data isolation

### Multi-Tenant Architecture Patterns
- **Company-Based Isolation**: Data segregation by company with shared user relationships
- **Cross-Company User Sharing**: Users can belong to multiple companies
- **Invitation Management**: Smart invitation system for new vs existing users
- **Role-Based Multi-Tenancy**: Different roles across different companies

### Mobile Optimization Patterns
- **Touch Calibration**: Signature pad accuracy improvements for mobile devices
- **Responsive Form Navigation**: Adaptive tab layouts for mobile screens
- **Camera Integration**: Native camera access for document capture
- **Progressive Enhancement**: Mobile-first with desktop enhancements

### Internationalization Patterns
- **Language Context**: Global language state management via React Context
- **Translation Keys**: Structured key-based translation system
- **Component-level Translation**: useTranslation hook in components
- **Form Validation i18n**: Localized validation messages in Zod schemas
- **Date/Number Formatting**: Locale-aware formatting utilities

## Performance Considerations

### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Unused code elimination
- **Dynamic Imports**: Lazy loading of heavy components
- **Asset Optimization**: Image and font optimization

### Runtime Performance
- **React Query Caching**: Intelligent data caching and invalidation
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large data sets (when needed)
- **Debounced Inputs**: Search and filter optimization

### Development Experience
- **Fast Refresh**: Sub-second hot reloads
- **TypeScript**: Compile-time error catching
- **ESLint**: Real-time code quality feedback
- **Component Tagging**: Development-only component identification

## Security Considerations

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access control
- **Session Management**: Secure session handling

### Data Security
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Token-based request validation

### File Upload Security
- **File Type Validation**: Strict file type checking
- **File Size Limits**: Prevent large file uploads
- **Virus Scanning**: Server-side file scanning (when implemented)
- **Secure Storage**: Supabase Storage with access policies