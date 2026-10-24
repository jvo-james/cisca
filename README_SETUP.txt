CISCA MAKEOVERS - BRAND COMMERCE REBUILD
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
success.html              Verified payment confirmation
admin.html                Protected admin dashboard

SHOP STARTING STATE
-------------------
All supplied products remain visible in the catalogue but start unavailable and without a selling price. Cisca can set price, upload a product image and switch availability on from admin. Unavailable products cannot be added to the bag or paid for.

SERVER-SIDE INTEGRATIONS
------------------------
Keep all secret values in Netlify environment variables. Never place them in config.js.

Required/expected variables include the Firebase Admin, Paystack, Resend and Cloudinary variables documented in env.example. PAYSTACK_CURRENCY defaults to GHS when omitted. SITE_URL should be the final production origin, for example https://ciscamakeovers.com.

After changing environment variables, trigger a fresh Netlify production deploy.

SECURITY MODEL
--------------
- Admin access uses Firebase Auth.
- Protected writes are handled through Netlify Functions/Firebase Admin.
- Paystack payments are verified server-side before paid records are confirmed.
- Resend API credentials stay server-side.
- Cloudinary uploads use server-generated signatures. Product uploads require admin authentication while booking inspiration uploads use the public booking flow.

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
8. Update an order status in admin and confirm the customer update email arrives.
9. Test the shop, booking and Academy payment flows end to end.
10. Review the site at mobile, tablet and desktop widths before launch.


VISUAL UPDATE NOTES
-------------------
- Non-gallery campaign imagery now uses Unsplash URLs from images.js with search comments for replacement.
- The gallery keeps its local lookbook images.
- The mobile header uses Font Awesome icons and hides while scrolling down then returns while scrolling up.
- Booking no longer uses a sticky step bar or fixed mobile appointment bar.
- Booking date selection moves the user to available times and stage changes return to the active section.
- Booking supports up to four inspiration photos through the existing Cloudinary environment.
- Paystack remains server-side initialized and verified. The existing Resend flow sends payment confirmations.


DESIGN AND EMAIL UPDATES
- The site uses Font Awesome 6.5.2 for icons and Unsplash for non-gallery photography. The Netlify Content-Security-Policy now permits these resources.
- Gallery photography is loaded from the local images folder. All usable WebP images in that folder are included in gallery.js.
- Add RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL and ADMIN_EMAILS in Netlify environment variables. EMAIL_FROM must use a verified sender domain in Resend for production delivery.
- Transactional messages cover booking started/confirmed, order started/confirmed, class registration started/confirmed, newsletter signup, contact messages and order or appointment status updates.
- Admin Email Studio sends campaigns in batches of 10 with at least one second between batches. Keep the admin page open until the campaign reports that it has finished. Larger campaigns can take longer.
- Appointment availability can be closed by date or given a custom comma-separated list of HH:MM time slots in Admin > Availability. Leave the times field empty to use the default schedule. A day is disabled on the booking calendar when all its configured slots are occupied.
- Booking drafts are saved in sessionStorage for the current tab. Inspiration-photo file selections must be chosen again after a refresh because browsers do not allow a website to restore file inputs.
- After successful Paystack verification, success.html displays a receipt with a print / save-as-PDF action.
