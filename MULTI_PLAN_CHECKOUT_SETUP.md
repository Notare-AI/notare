# Multi-Plan Checkout Implementation Guide

## Overview
This guide details the implementation of dynamic multi-plan checkout for Notare, allowing users to select different subscription plans from the landing page and complete the checkout process.

## Changes Made

### 1. Updated Pricing Component (`src/components/landing/Pricing.tsx`)
- Updated to a two-tier model: "Free" and "Research Pro".
- Modified Button links to navigate to `/checkout?plan=research-pro` for the paid plan.
- Free plan still navigates to `/login`.

### 2. Updated Checkout Page (`src/pages/Checkout.tsx`)
- Updated URL parameter parsing to look for `plan=research-pro`.
- Updated logic to use the `VITE_STRIPE_PRICE_ID_RESEARCH_PRO` environment variable.

### 3. Updated Backend Edge Function (`supabase/functions/create-checkout-session/index.ts`)
- Removed hardcoded price IDs.
- Updated `VALID_PRICE_IDS` array to only include `STRIPE_PRICE_ID_RESEARCH_PRO`.
- Security validation ensures only the valid price ID is processed.

### 4. Updated Environment Variables (`.env`)
- The following environment variable is now required:
  - `VITE_STRIPE_PRICE_ID_RESEARCH_PRO=price_research_pro_placeholder`

## Setup Instructions

### Step 1: Create Stripe Product and Price
1. Log into your Stripe Dashboard.
2. Go to Products and create a product for the **Research Pro Plan**: £10/month subscription.
3. Copy the Price ID (it starts with `price_`).

### Step 2: Update Environment Variables
Replace the placeholder value in your `.env` file:
```bash
VITE_STRIPE_PRICE_ID_RESEARCH_PRO=price_1234567890abcdef  # Your actual Research Pro plan Price ID
```

### Step 3: Update Supabase Edge Function Environment
In your Supabase dashboard:
1. Go to Edge Functions → create-checkout-session → Settings
2. Add the same environment variable:
   - `STRIPE_PRICE_ID_RESEARCH_PRO`

### Step 4: Deploy and Test
1. Deploy your updated edge function to Supabase.
2. Test the flow:
   - Navigate to the pricing page.
   - Click "Upgrade to Pro".
   - Verify you're redirected to `/checkout?plan=research-pro`.
   - Confirm the checkout session loads with the correct plan.

## Security Features

### Price ID Validation
The backend validates that only the approved price ID can be used:
- Maintains a whitelist of the valid price ID.
- Rejects any requests with invalid or missing price IDs.
- Prevents users from manipulating checkout sessions.

## User Flow

1. **Landing Page**: User views pricing options.
2. **Plan Selection**: User clicks "Upgrade to Pro".
3. **Checkout Page**: User is redirected to `/checkout?plan=research-pro`.
4. **Price Validation**: Frontend validates plan and selects correct price ID.
5. **Session Creation**: Backend creates Stripe session with validated price ID.
6. **Payment**: User completes payment through Stripe Embedded Checkout.