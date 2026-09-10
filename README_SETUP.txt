CISCA MAKEOVERS REBUILD
=======================

This is a full replacement build. It is intentionally not styled like the old Cisca site.

WHAT IS INCLUDED
----------------
1. Beauty studio
   - New homepage and service discovery
   - New multi-service appointment booking page
   - Admin-controlled service prices and active state
   - Admin-controlled date availability
   - Server-side Paystack payment initialization and verification
   - Customer + admin Resend emails
   - Appointment status emails from admin

2. Cisca Academy
   - Academy landing page
   - Detailed CM Beginner Makeup Guide
   - Supplied YouTube tutorial link
   - Class catalogue
   - Student registration + Paystack payment
   - Admin class pricing/open-registration controls
   - Student records in admin
   - Customer + admin Resend emails

3. Cisca Shop
   - 163 supplied products grouped into Makeup, Nails, Brow & Lash and Hair
   - Search and category filtering
   - Product detail pages
   - Cart and secure checkout
   - Every supplied product starts with price=null and available=false
   - Admin sets prices and availability before anything can be purchased
   - Admin can upload a product photo securely through Cloudinary
   - Customer + admin order emails
   - Admin order status updates email the customer
   - Public order tracking with order number + email or phone
   - Secure token tracking links from customer emails

4. General
   - Contact form stored in Firebase and emailed through Resend
   - Newsletter subscriptions stored in Firebase and emailed through Resend
   - New gallery
   - Responsive light-mode design
   - All repository images live inside /images
   - Existing large images were converted/resized to WebP. The curated image folder is roughly 2.7 MB instead of the old repo's roughly 69 MB.

FIRST DEPLOYMENT
----------------
1. Replace the old repository with these files.
2. Run npm install locally only if you need local Netlify Functions. Netlify installs package.json dependencies during deploy.
3. Set these Netlify Environment Variables:

SITE_URL=https://ciscamakeovers.com
PAYSTACK_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
EMAIL_FROM=Cisca Makeovers <hello@your-verified-resend-domain.com>
ADMIN_EMAIL=the-email-that-should-receive-notifications@example.com
ADMIN_EMAILS=admin-login@example.com

Firebase Admin, either:
FIREBASE_PROJECT_ID=cisca-makeovers-e7c3c
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

or:
FIREBASE_SERVICE_ACCOUNT={complete Firebase service account JSON}

For product image uploads:
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

4. Firebase Authentication
   - Keep Email/Password sign-in enabled.
   - Create the admin account in Firebase Authentication.
   - Put that exact email in ADMIN_EMAILS.

5. Open /admin.html and sign in.
6. Go to Products and click "Load supplied product list" once.
   - This initializes missing products/services/classes only.
   - It does not overwrite records that already exist.
7. Set class fees/open registration as needed.
8. Set product prices, upload product photos, and switch products on when they are in stock.
9. Set any closed appointment dates under Availability.

IMPORTANT PAYMENT DESIGN
------------------------
The browser does not decide whether a payment succeeded.
The server initializes Paystack, stores a pending record, verifies the Paystack transaction server-side on return, checks the paid amount, then marks the booking/class/order paid. Confirmation emails are only sent after server verification.

EMAIL DESIGN
------------
Resend is server-side only. Do not put RESEND_API_KEY in config.js or any browser file.
Use a verified sending domain in EMAIL_FROM for production delivery.
SPF + DKIM should be verified. DMARC is also recommended.

FIREBASE NOTE
-------------
config.js contains the existing Cisca Firebase web configuration from the attached repository. Firebase web configuration is public by design. Sensitive Firebase Admin credentials remain in Netlify Environment Variables only.

PRODUCT PRICES
--------------
The numbers supplied beside items in the brief were deliberately ignored. All shop products start unavailable with no price.

DOMAIN
------
CNAME, robots.txt and sitemap.xml currently use ciscamakeovers.com because that was the domain configured in the attached repository. Change these if the production domain changes.
