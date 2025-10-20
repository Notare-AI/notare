# Multi-Plan Checkout Implementation Guide

## Overview
This guide details the implementation of dynamic multi-plan checkout for Notare, allowing users to select different subscription plans (Personal £8, Professional £15) from the landing page and complete the checkout process.

## Changes Made

### 1. Updated Pricing Component (`src/components/landing/Pricing.tsx`)
- Added `planId` property to each pricing tier:
  - `planId: null` for Free plan (no checkout needed)
  - `planId: 'personal'` for Personal plan (£8)
  - `planId: 'professional'` for Professional plan (£15)
- Modified Button links to navigate to `/checkout?plan={planId}` instead of `/login`
- Free plan still navigates to `/login` as before

### 2. Updated Checkout Page (`src/pages/Checkout.tsx`)
- Added URL parameter parsing with `useSearchParams`
- Added plan validation and price ID selection logic
- Added error handling for invalid plans
- Modified the Supabase function call to include `priceId` in the request body
- Added automatic redirection to pricing page for invalid plans

### 3. Updated Backend Edge Function (`supabase/functions/create-checkout-session/index.ts`)
- Removed hardcoded `STRIPE_PRICE_ID` 
- Added environment variables for multiple price IDs:
  - `STRIPE_PRICE_ID_PERSONAL`
  - `STRIPE_PRICE_ID_PROFESSIONAL`
- Added `VALID_PRICE_IDS` array for security validation
- Modified request parsing to accept `priceId` from request body
- Added security validation to ensure only valid price IDs are processed
- Updated Stripe session creation to use dynamic `priceId`

### 4. Updated Environment Variables (`.env`)
- Added placeholder environment variables:
  - `VITE_STRIPE_PRICE_ID_PERSONAL=price_personal_placeholder`
  - `VITE_STRIPE_PRICE_ID_PROFESSIONAL=price_professional_placeholder`

## Setup Instructions

### Step 1: Create Stripe Products and Prices
1. Log into your Stripe Dashboard
2. Go to Products and create two products:
   - **Personal Plan**: £8/month subscription
   - **Professional Plan**: £15/month subscription
3. Copy the Price IDs (they start with `price_`) for each plan

### Step 2: Update Environment Variables
Replace the placeholder values in your `.env` file:
```bash
VITE_STRIPE_PRICE_ID_PERSONAL=price_1234567890abcdef  # Your actual Personal plan Price ID
VITE_STRIPE_PRICE_ID_PROFESSIONAL=price_0987654321fedcba  # Your actual Professional plan Price ID
```

### Step 3: Update Supabase Edge Function Environment
In your Supabase dashboard:
1. Go to Edge Functions → create-checkout-session → Settings
2. Add the same environment variables:
   - `STRIPE_PRICE_ID_PERSONAL`
   - `STRIPE_PRICE_ID_PROFESSIONAL`

### Step 4: Deploy and Test
1. Deploy your updated edge function to Supabase
2. Test the flow:
   - Navigate to the pricing page
   - Click "Upgrade to Personal" or "Go Professional"
   - Verify you're redirected to `/checkout?plan=personal` or `/checkout?plan=professional`
   - Confirm the checkout session loads with the correct plan

## Security Features

### Price ID Validation
The backend validates that only approved price IDs can be used:
- Maintains a whitelist of valid price IDs
- Rejects any requests with invalid or missing price IDs
- Prevents users from manipulating checkout sessions

### Error Handling
- Invalid plan parameters redirect users back to pricing page
- Missing environment variables show appropriate error messages
- Failed checkout initialization provides user-friendly feedback

## User Flow

1. **Landing Page**: User views pricing options
2. **Plan Selection**: User clicks "Upgrade to Personal" or "Go Professional"
3. **Checkout Page**: User is redirected to `/checkout?plan={planId}`
4. **Price Validation**: Frontend validates plan and selects correct price ID
5. **Session Creation**: Backend creates Stripe session with validated price ID
6. **Payment**: User completes payment through Stripe Embedded Checkout

## Testing Checklist

- [ ] Personal plan button redirects to `/checkout?plan=personal`
- [ ] Professional plan button redirects to `/checkout?plan=professional`
- [ ] Free plan button still redirects to `/login`
- [ ] Invalid plan parameters redirect to pricing page
- [ ] Checkout loads correctly for valid plans
- [ ] Payment completes successfully for both plans
- [ ] Invalid price IDs are rejected by backend

## Troubleshooting

### Common Issues
1. **"Invalid plan selected"**: Check that price ID environment variables are set correctly
2. **Checkout won't load**: Verify Supabase edge function has the new environment variables
3. **Wrong price in checkout**: Confirm you're using the correct Stripe Price IDs

### Environment Variable Locations
- **Frontend**: `.env` file (prefixed with `VITE_`)
- **Supabase Functions**: Set in Supabase dashboard under Edge Functions settings

This implementation provides a secure, scalable foundation for multiple subscription plans while maintaining backward compatibility with existing functionality.