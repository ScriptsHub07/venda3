# HYPEX E-commerce Documentation

## API Endpoints

### Authentication
- `POST /auth/callback`
  - Handles Google OAuth callback
  - Params: `code` (query string)
  - Returns: Redirects to home page

### Products
- `GET /api/products`
  - List all published products
  - Optional query params: `page`, `limit`, `category`
  - Returns: List of products

### Cart
- Client-side only (uses localStorage)
- State management through CartContext

### Orders
- `POST /api/orders`
  - Create new order
  - Body: `{ addressId: string, items: Array<{ productId: string, quantity: number }>, couponCode?: string }`
  - Returns: Order details

### Payments
- `POST /api/payments/pix`
  - Create PIX payment
  - Body: `{ orderId: string, amount: number, description: string }`
  - Returns: QR code and "copia e cola" text

### Webhooks
- `POST /api/webhooks/pix`
  - Handle PIX payment notifications
  - Headers: `x-efi-signature`
  - Body: Payment status update from EFI Bank

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Auth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=your-from-email

# EFI Bank
EFI_CLIENT_ID=your-efi-client-id
EFI_CLIENT_SECRET=your-efi-client-secret
EFI_SANDBOX=true
WEBHOOK_SECRET=your-webhook-secret

# App
NEXT_PUBLIC_APP_URL=your-app-url
```

## Database Schema

See `src/lib/supabase/schema.sql` for complete database schema.

## Type Definitions

See `src/lib/types/database.ts` for TypeScript type definitions.

## Core Features

1. Authentication
   - Google OAuth integration
   - Session management with Supabase Auth

2. Product Management
   - Up to 5 images per product
   - Stock management
   - Product status (draft/published/out of stock)

3. Cart System
   - Checkbox selection
   - Persistent storage
   - Quantity management

4. Checkout Flow
   - Address management
   - PIX integration with EFI Bank
   - Order confirmation emails

5. Admin Panel
   - Product management
   - Coupon management
   - Order management
   - Delivery status updates

## Security Features

1. Row Level Security (RLS) policies in Supabase
2. Admin-only routes protection
3. Webhook signature verification
4. Input validation with Zod

## Testing Checklist

### Authentication
- [ ] Google login works correctly
- [ ] Session persistence works
- [ ] Protected routes are secure
- [ ] Logout works correctly

### Product Management
- [ ] Products can be created with images
- [ ] Stock is updated correctly
- [ ] Product status changes work
- [ ] Images are properly stored and served

### Shopping Cart
- [ ] Items can be added to cart
- [ ] Quantities can be updated
- [ ] Items can be removed
- [ ] Cart persists after page reload
- [ ] Checkboxes work correctly
- [ ] Total updates correctly

### Checkout
- [ ] Address validation works
- [ ] PIX QR code generation works
- [ ] Payment confirmation is received
- [ ] Order status updates correctly
- [ ] Confirmation emails are sent

### Admin Panel
- [ ] Product CRUD operations work
- [ ] Coupon management works
- [ ] Order status can be updated
- [ ] Delivery tracking works

### Security
- [ ] Admin routes are protected
- [ ] API endpoints are secured
- [ ] Input validation works
- [ ] Webhook signatures are verified

### Performance
- [ ] Image optimization works
- [ ] Page load times are acceptable
- [ ] Cart operations are smooth
- [ ] Admin panel is responsive

### UI/UX
- [ ] Responsive on all devices
- [ ] Animations are smooth
- [ ] Error messages are clear
- [ ] Loading states are shown
- [ ] Form validation feedback works

### Error Handling
- [ ] Payment failures are handled gracefully
- [ ] Network errors show appropriate messages
- [ ] Form validation errors are clear
- [ ] API errors are properly caught

## Deployment Checklist

1. Environment Setup
   - [ ] All environment variables are set
   - [ ] Supabase project is configured
   - [ ] Google OAuth is set up
   - [ ] EFI Bank integration is configured
   - [ ] Email service is configured

2. Database
   - [ ] All tables are created
   - [ ] RLS policies are in place
   - [ ] Indexes are created
   - [ ] Backups are configured

3. Storage
   - [ ] Product images bucket is configured
   - [ ] Storage rules are set
   - [ ] CDN is configured

4. Monitoring
   - [ ] Error tracking is set up
   - [ ] Performance monitoring is enabled
   - [ ] API monitoring is configured
   - [ ] Database monitoring is active

## Regular Maintenance Tasks

1. Database
   - Monitor performance
   - Check storage usage
   - Review error logs
   - Backup verification

2. Security
   - Review access logs
   - Check failed login attempts
   - Update dependencies
   - Review API usage

3. Content
   - Archive old products
   - Clean up unused images
   - Update featured products
   - Review customer feedback

4. Performance
   - Monitor page load times
   - Check API response times
   - Optimize database queries
   - Review cache effectiveness