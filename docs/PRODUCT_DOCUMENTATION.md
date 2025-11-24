# Antartur - Product Documentation

**Version:** 0.1.0  
**Last Updated:** November 2025  
**Product Owner:** Antartur Team

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Target Users](#target-users)
3. [User Journey](#user-journey)
4. [Features & Functionality](#features--functionality)
5. [Content Structure](#content-structure)
6. [Booking Flow](#booking-flow)
7. [Payment Options](#payment-options)
8. [Currency Management](#currency-management)
9. [Tour Categories](#tour-categories)
10. [Contact & Support](#contact--support)
11. [Future Roadmap](#future-roadmap)

---

## Product Overview

### Mission Statement

Antartur provides unforgettable adventure experiences in Tierra del Fuego, connecting travelers with the pristine nature and unique landscapes of Ushuaia through carefully curated tours and exceptional service.

### Product Vision

To become the leading digital booking platform for adventure tourism in Tierra del Fuego, offering seamless online reservations, multi-currency support, and exceptional customer experience.

### Current Status

**Phase:** Migration from WordPress to Next.js (MVP in progress)

**Live Features:**
- ✅ Tour browsing and detailed information
- ✅ Interactive booking calendar
- ✅ Multi-currency pricing (ARS/USD)
- ✅ Passenger data collection
- ✅ Contact form
- ✅ Responsive design

**In Development:**
- 🚧 Real payment processing
- 🚧 Order management system
- 🚧 Admin dashboard
- 🚧 Email automation

---

## Target Users

### Primary Personas

#### 1. International Tourist (Sarah, 32, USA)
**Profile:**
- English speaker, basic Spanish
- Planning 1-week trip to Ushuaia
- Budget: Mid to high-end ($150-300 USD per tour)
- Tech-savvy, books everything online
- Compares prices across platforms

**Needs:**
- Clear pricing in USD
- Detailed tour information
- Easy online booking
- Mobile-friendly interface
- Email confirmation and updates

**Pain Points:**
- Language barriers
- Currency confusion
- Availability uncertainty
- Complex checkout processes

#### 2. Argentine Traveler (Juan, 45, Buenos Aires)
**Profile:**
- Spanish speaker
- Weekend or holiday trip
- Budget: Flexible (ARS pricing)
- Prefers bank transfer for payment
- Values local expertise

**Needs:**
- Pricing in ARS
- Multiple payment options
- Spanish content
- WhatsApp communication option
- Flexible cancellation policies

**Pain Points:**
- Currency volatility
- Payment method limitations
- Availability during peak seasons

#### 3. Corporate Client (María, 38, HR Manager)
**Profile:**
- Organizing team building event
- Group of 10-20 people
- Need customized itineraries
- Requires invoicing and receipts
- Long booking lead time

**Needs:**
- Group discounts
- Custom tour packages
- Professional invoicing
- Direct contact with organizers
- Dietary restrictions handling

**Pain Points:**
- Complex group bookings
- Special requirements management
- Budget approval processes

---

## User Journey

### Discovery Phase

**Entry Points:**
1. Google Search (SEO)
2. Social Media (Instagram, Facebook)
3. Travel Agency referral
4. TripAdvisor/Reviews
5. Direct URL

**Home Page Experience:**
```
Landing → Hero with stunning imagery
       → Quick tour categories (Winter/Summer/Antarctica)
       → Featured tours grid
       → Testimonials
       → Call-to-action buttons
```

### Exploration Phase

**Tour Discovery:**
```
Home → Tours Page (filtered by season)
     → Tour Cards (image, title, price, difficulty)
     → Click card → Tour Detail Page
```

**Tour Detail Page Elements:**
- Hero image with tour name
- Quick info (price, duration, difficulty)
- Reserve button (sticky on mobile)
- Long description
- Photo gallery
- Timeline/Itinerary
- Restrictions and requirements
- Testimonials
- Related tours
- Booking widget

### Decision Phase

**Factors Influencing Booking:**
1. **Price Transparency:** Clear ARS/USD pricing
2. **Availability:** Real-time calendar
3. **Information Completeness:** All details upfront
4. **Social Proof:** Testimonials and reviews
5. **Trust Signals:** Contact info, WhatsApp button

### Booking Phase

```
Tour Detail → Click "RESERVAR"
           → Calendar opens
           → Select date
           → Choose time slot
           → Enter passenger count
           → Modal shows subtotal
           → Click "Realizar una reserva"
           → Navigate to Checkout
```

### Checkout Phase

```
Checkout → Billing information
        → Passenger details (adults + children)
        → Restrictions validation
        → Order summary (MiniCart)
        → Select payment method
        → Submit
        → (Future) Payment processing
        → Confirmation
```

### Post-Booking Phase

**Current:** 
- No automated confirmation
- Manual processing by staff

**Future:**
- Automated email confirmation
- Order tracking
- Reminders before tour date
- Post-tour review request

---

## Features & Functionality

### 1. Tour Browsing

**Tour Grid:**
- Responsive grid layout (3 columns desktop, 1 mobile)
- Filter by season (Winter/Summer)
- Card shows: Image, title, difficulty, price
- Hover effects for better UX

**Tour Detail:**
- Hero with full-width image
- Sticky booking widget (mobile)
- Expandable sections
- Related tours suggestions

### 2. Booking Calendar

**Features:**
- Month navigation (prev/next)
- Available dates highlighted
- Disabled dates grayed out
- Tooltip shows availability count
- Multiple time slots per day
- Visual feedback on selection

**Availability Logic:**
- Dates with bookings show availability
- Past dates disabled
- Sold-out dates shown but disabled
- Availability updates in real-time (future)

### 3. Passenger Management

**Data Collection:**
- Full name
- Date of birth
- Document/Passport number
- Address and phone
- Dietary restrictions (vegetarian, vegan, celiac, allergies)
- Health restrictions (pregnancy, back problems)

**Validation:**
- All fields required (except optional ones)
- Age validation based on adult/child selection
- Restriction acknowledgment mandatory
- Email format validation

**Dynamic Forms:**
- Forms generated based on passenger count
- Add/remove passengers
- Duplicate data helper (future feature)
- Form state persistence

### 4. Currency Switcher

**Location:** Header (top right)

**Functionality:**
- Toggle between ARS and USD
- Persists preference in localStorage
- Updates all prices instantly
- Affects payment method options

**Pricing Rules:**
- ARS: Shows pesos ($180.000)
- USD: Shows dollars (USD 180.00)
- Exchange rate embedded in tour data
- No real-time conversion (static rates)

### 5. Payment Methods

**ARS Currency:**
- Transferencia bancaria directa
- Payway Payment (credit/debit cards)

**USD Currency:**
- PayPal only

**Current Status:** Mock implementation (simulation)

### 6. Contact Form

**Fields:**
- Name
- Email
- Phone
- Message

**Features:**
- reCAPTCHA v2 protection
- Rate limiting (10/hour per IP)
- Server-side validation
- Email sending via Nodemailer

### 7. Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Hamburger menu
- Sticky booking button
- Full-width forms
- Touch-friendly buttons
- Simplified navigation

---

## Content Structure

### Page Hierarchy

```
Home
├── Tours
│   └── [Tour Detail]
│       └── Booking Calendar
│           └── Checkout
├── Invierno (Winter Tours)
├── Verano (Summer Tours)
├── Antártida (Antarctica)
├── Turismo Corporativo (Corporate)
├── Clima (Weather Info)
├── Ushuaia
│   ├── Hoteles
│   └── Gastronomía
└── Contacto
```

### Tour Content Elements

Each tour includes:

1. **Basic Info:**
   - ID (URL slug)
   - Title
   - Subtitle
   - Category (winter/summer)
   - Difficulty level

2. **Pricing:**
   - Price Adult (ARS)
   - Price Child (ARS)
   - Price Adult USD
   - Price Child USD

3. **Media:**
   - Hero image
   - Featured image (card)
   - Gallery (4-17 images)

4. **Description:**
   - Short description (card)
   - Long description (paragraphs)
   - Highlights/Features

5. **Logistics:**
   - Duration
   - Included items (lunch, equipment, etc.)
   - Restrictions
   - Meeting point
   - What to bring

6. **Timeline:**
   - Hourly itinerary
   - Step-by-step description
   - Important notes

7. **Booking Data:**
   - Available dates
   - Time slots
   - Capacity per slot

8. **SEO:**
   - Meta title
   - Meta description
   - Canonical URL
   - Open Graph image

---

## Booking Flow

### Step-by-Step User Experience

#### Step 1: Tour Selection
**User Action:** Clicks on a tour card  
**System Response:**  
- Loads tour detail page
- Displays all tour information
- Shows booking calendar
- Enables "RESERVAR" button

#### Step 2: Date Selection
**User Action:** Clicks "RESERVAR" button  
**System Response:**  
- Scrolls to booking section
- Highlights available dates in calendar
- Shows tooltip with availability on hover

**User Action:** Clicks an available date  
**System Response:**  
- Date selected (highlighted)
- If multiple time slots, shows radio buttons
- Shows "Reservar" button below calendar

#### Step 3: Time Slot Selection (if applicable)
**User Action:** Selects a time slot  
**System Response:**  
- Radio button selected
- Updates availability display
- Enables reservation button

#### Step 4: Passenger Count
**User Action:** Clicks "Reservar"  
**System Response:**  
- Opens modal with booking details
- Shows date and time
- Provides passenger count inputs

**User Action:** Adjusts adult and child counts  
**System Response:**  
- Updates subtotal in real-time
- Shows currency-correct price
- Validates against availability
- If exceeds, shows warning message

#### Step 5: Confirmation
**User Action:** Clicks "Realizar una reserva"  
**System Response:**  
- Saves booking data to localStorage
- Navigates to `/checkout`
- Pre-fills order summary

#### Step 6: Billing Information
**User Action:** Fills billing form  
**System Response:**  
- Real-time validation
- Error messages for invalid fields
- Progress indication

#### Step 7: Passenger Details
**User Action:** Fills each passenger form  
**System Response:**  
- Separate form for each passenger
- Validates age against passenger type
- Checks restrictions
- Shows remove button (if > min passengers)

#### Step 8: Restriction Validation
**System Checks:**  
- If tour has pregnancy restriction + passenger is pregnant → Show alert
- If tour has health restriction + passenger has issues → Show alert
- If restrictions violated → Change flow to "Consulta"
- If all OK → Proceed to payment

#### Step 9: Payment Method Selection
**User Action:** Selects payment method  
**System Response:**  
- Shows payment info/instructions
- Updates submit button text
- If "Consulta" flow → Button says "CONSULTAR DISPONIBILIDAD"
- If normal flow → Button says "RESERVAR"

#### Step 10: Submit
**User Action:** Clicks submit  
**System Response (Current):**  
- Validates all forms
- Shows payment modal (simulation)
- (Manual processing by staff)

**System Response (Future):**  
- Creates order in database
- Processes payment via gateway
- Sends confirmation email
- Shows confirmation page

---

## Payment Options

### Transferencia Bancaria Directa (ARS)

**Target:** Argentine customers  
**Flow:**  
1. User selects this method
2. After checkout, receives bank details
3. Manually transfers money
4. Sends proof of payment
5. Staff confirms and approves booking

**Advantages:**
- No fees
- Familiar to Argentines
- No intermediaries

**Disadvantages:**
- Manual verification required
- Delayed confirmation
- Risk of fraud

### Payway Payment (ARS)

**Target:** Argentine customers with cards  
**Flow:**  
1. User selects Payway
2. Redirected to Payway gateway
3. Enters card details
4. Real-time authorization
5. Immediate confirmation

**Advantages:**
- Instant confirmation
- Automated process
- Multiple installments (cuotas)

**Disadvantages:**
- Service fees
- Requires integration

### PayPal (USD)

**Target:** International customers  
**Flow:**  
1. User selects PayPal
2. Redirected to PayPal
3. Logs in or pays as guest
4. Completes payment
5. Returns to site with confirmation

**Advantages:**
- International standard
- Buyer protection
- Multi-currency support

**Disadvantages:**
- High fees (~4-5%)
- Currency conversion fees
- Requires PayPal account (optional)

---

## Currency Management

### Why Two Currencies?

**Challenge:**  
Argentina experiences high inflation and currency volatility. Local customers prefer ARS, international customers prefer USD.

**Solution:**  
Dual pricing with toggle switcher.

### Implementation

**Data Structure:**
```json
{
  "pricing": {
    "currency": "ARS",
    "priceAdult": 180000,
    "priceChild": 150000,
    "priceAdultUSD": 180,
    "priceChildUSD": 150
  }
}
```

**Display Logic:**
- Currency preference stored in localStorage
- On switch, all prices update instantly
- Payment methods adapt to currency
- No real-time exchange rates (managed manually)

### Exchange Rate Management

**Current:** Static rates embedded in tour data  
**Responsibility:** Admin manually updates prices

**Future Options:**
1. **Manual:** Continue current approach (simple, controlled)
2. **Semi-automatic:** Admin sets base price + margin, system calculates
3. **Automatic:** Real-time API (e.g., Banco Nación), but risky due to volatility

**Recommendation:** Start with manual, move to semi-automatic with admin overrides.

---

## Tour Categories

### Winter Tours (Invierno)

**Season:** June - September  
**Characteristics:**  
- Snow-based activities
- Cold weather gear provided
- Limited daylight
- Popular with ski enthusiasts

**Examples:**
- 4x4 Invernal
- Aventura Blanca
- Full Day Nieve
- Nieve & Fuego
- Trekking Esmeralda Invernal

### Summer Tours (Verano)

**Season:** December - March  
**Characteristics:**  
- Long daylight hours
- Trekking and hiking
- Water activities
- Milder temperatures

**Examples:**
- Lagos Off Road
- Trekking Laguna Esmeralda
- Trekking Glaciar Vinciguerra
- Trekking Glaciar Ojo del Albino
- Parque Trekking & Canoas
- Pinguinera Isla Martillo

### Antarctica Expeditions

**Season:** November - March  
**Characteristics:**  
- Multi-day expeditions
- High-end pricing
- Requires advance booking
- Limited availability

**Note:** Currently informational only, booking handled separately.

### Corporate Tourism

**Target:** Companies and organizations  
**Offerings:**  
- Team building activities
- Customized itineraries
- Group discounts
- Professional invoicing

**Note:** Requires contact form submission for quotes.

---

## Contact & Support

### Contact Channels

1. **Website Contact Form**
   - Located at `/contacto`
   - Rate-limited for security
   - reCAPTCHA protected
   - Email notifications to staff

2. **WhatsApp Button**
   - Floating button (bottom right)
   - Pre-filled message with context
   - Direct chat with staff

3. **Phone**
   - Displayed in header/footer
   - Business hours only

4. **Email**
   - Displayed in footer
   - General inquiries

5. **Social Media**
   - Instagram, Facebook links
   - DM responses during business hours

### Response Times

**Current:**  
- Email: 24-48 hours
- WhatsApp: 2-4 hours (business hours)
- Phone: Immediate (business hours)

**Target (Future):**  
- Email: 12-24 hours
- WhatsApp: < 1 hour
- Automated responses for common questions

---

## Future Roadmap

### Phase 1: MVP Completion (Current)
**Timeline:** November 2025  
**Goals:**
- Complete Next.js migration
- Fix all critical bugs
- Deploy to production
- Basic order management

### Phase 2: Backend & API
**Timeline:** December 2025 - January 2026  
**Goals:**
- Database implementation
- API development
- Admin dashboard
- Real availability management

### Phase 3: Payment Integration
**Timeline:** February 2026  
**Goals:**
- PayPal integration
- Payway integration
- Automated confirmations
- Order status tracking

### Phase 4: Enhancements
**Timeline:** March 2026+  
**Goals:**
- Email automation
- User accounts
- Order history
- Loyalty program
- Mobile app (consideration)

### Phase 5: Advanced Features
**Timeline:** Q2-Q3 2026  
**Goals:**
- Multi-language support (English)
- Advanced analytics
- Dynamic pricing
- Inventory management
- CRM integration

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Business Metrics:**
- Conversion rate (visitors → bookings)
- Average order value
- Booking cancellation rate
- Revenue per visitor

**User Experience:**
- Page load time
- Bounce rate
- Time on site
- Cart abandonment rate

**Technical:**
- Uptime (target: 99.9%)
- API response time
- Error rate
- Mobile vs desktop usage

**Customer Satisfaction:**
- NPS (Net Promoter Score)
- Post-tour reviews
- Support ticket volume
- Resolution time

---

## Appendix: Content Guidelines

### Tone of Voice

**Personality:** Adventurous, professional, welcoming  
**Language:** Clear, enthusiastic, informative  
**Avoid:** Jargon, overly salesy, passive voice

**Example:**
- ❌ "Participants will be transported to the location"
- ✅ "We'll pick you up from your hotel and head to the trailhead"

### Image Guidelines

**Hero Images:**
- Minimum 1920x1080px
- High quality, professional
- Showcases tour highlight
- People in action (when possible)

**Gallery Images:**
- Minimum 1200x800px
- Variety of angles and moments
- Include people for scale
- Mix of wide and detail shots

### SEO Best Practices

**Title Tags:** 50-60 characters  
**Meta Descriptions:** 150-160 characters  
**Headings:** H1 once, H2 for sections, H3 for subsections  
**Alt Text:** Descriptive, includes location/activity  
**URL Slugs:** Lowercase, hyphens, descriptive

---

**Document Version:** 1.0  
**Product Owner:** Antartur Team  
**Last Review:** November 2025

