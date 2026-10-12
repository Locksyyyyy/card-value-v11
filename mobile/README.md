# CardValue UK mobile packaging

The production web app is the source of truth. After the Vercel deployment is live, create a Capacitor shell pointing at the production URL for iOS/Android packaging.

Suggested flow:
1. `npm create @capacitor/app` in a separate mobile project.
2. Set the app ID to `uk.cardvalue.app` (or your final registered ID).
3. Configure the production CardValue URL.
4. Add `@capacitor/ios` and `@capacitor/android`.
5. Build/sign in Xcode and Android Studio.
6. Complete Apple App Store and Google Play review.

Do not embed API secrets in the mobile app. Authentication, AI keys, eBay credentials and Stripe secrets stay server-side.
