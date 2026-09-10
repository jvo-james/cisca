CISCA MAKEOVERS — BRAND COMMERCE REBUILD
=========================================

This repo is a full light-mode rebuild of Cisca Makeovers around four connected customer journeys:
SEE IT (Lookbook) · WEAR IT (Studio/Booking) · LEARN IT (Academy) · SHOP IT (Beauty commerce)

ROOT STRUCTURE
--------------
The only folders at the repo root are:
- images/
- netlify/

All CSS and JavaScript files are separate root files. images.js is the central local image map. config.js contains public frontend configuration only.

CUSTOMER PAGES
--------------
index.html                Brand/commerce homepage
shop.html                 Searchable/filterable 163-product catalogue
product.html              Product detail / recommendations
cart.html                 Shopping bag
checkout.html             Paystack checkout handoff
services.html             Studio services
booking.html              Four-step appointment booking
academy.html              Academy/course discovery
class-registration.html   Student registration/payment
student-resources.html     CM Beginner Makeup Guide + tutorial
 gallery.html              Cisca Lookbook
about.html                Brand story
contact.html              Appointment/Academy/order contact paths
track.html                Public order tracking by email or phone
success.html              Verified payment confirmation
admin.html                Protected admin dashboard

SHOP STARTING STATE
-------------------
All supplied products remain visible in the catalogue but start unavailable and without a selling price. Cisca can set price, upload a product image and switch availability on from admin. Unavailable products cannot be added to the bag or paid for.

SERVER-SIDE INTEGRATIONS
------------------------
Keep all secret values in Netlify environment variables. Never place them in config.js.

Required/expected variables include the existing Firebase Admin, Paystack, Resend and Cloudinary variables documented in env.example. SITE_URL should be the final production origin, for example https://ciscamakeovers.com.

After changing environment variables, trigger a fresh Netlify production deploy.

SECURITY MODEL
--------------
- Admin access uses Firebase Auth.
- Protected writes are handled through Netlify Functions/Firebase Admin.
- Paystack payments are verified server-side before paid records are confirmed.
- Resend API credentials stay server-side.
- Cloudinary product uploads use the protected admin path.
- Public order tracking supports order number + email or phone, plus opaque tracking-token links from order emails.

VISUAL SYSTEM
-------------
Warm ivory, espresso, deep burgundy and dusty rose.
Playfair Display is reserved for campaign/editorial moments.
Manrope is used for commerce, navigation, forms and utility information.
The design intentionally avoids generic rounded SaaS cards. Layouts use photography, rules, contrast, product density and content-led spacing.

DEPLOYMENT CHECKLIST
--------------------
1. Confirm all Netlify environment variables.
2. Deploy the repo.
3. Sign in to admin and seed the supplied product catalogue if Firestore is empty.
4. Set at least one product price/image/availability and test add-to-bag + checkout.
5. Test a studio booking payment.
6. Open one Academy class, set its fee and test student registration.
7. Test Resend customer/admin messages for orders, bookings, class registrations, contact and newsletter.
8. Update an order status in admin and test the Track Order button in the customer email.
9. Test public order tracking with order + email and order + phone.
10. Review the site at mobile, tablet and desktop widths before launch.
