# Alviva Closed Test & Release Checklist

## Before creating the AAB

Run from the `CalorieApp` folder:

```powershell
npm ci
npm run doctor
npm run typecheck
npm run export:android
```

All four commands should complete without errors before creating the Play Store build.

Also confirm your Expo/EAS environment contains:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (or publishable key)

Do not put Supabase service-role credentials in the mobile app.

## Build for Google Play

Production profile should produce an Android App Bundle (.aab):

```powershell
eas build --platform android --profile production
```

Package ID: `com.alviva.app`

## Closed test

Keep at least 12 testers opted in continuously for 14 days before applying for production access.

Each tester should use a separate Alviva account where practical.

### Day 1 core test

- Install from the Google Play closed-test link.
- Open app and confirm splash/icon are correct.
- Create an email account.
- Sign in with email/password.
- Sign out and sign back in.
- Test Google sign-in.
- Test Forgot Password on a disposable test account.
- Fill Profile (age, gender, weight, height, activity).
- Change daily calorie goal.
- Add and remove water.
- Scan a real meal from camera.
- Scan a meal from gallery.
- Edit the detected food name.
- Test Small, Medium, Large, and Custom portion.
- Confirm the saved meal appears on Home and Progress.
- Confirm streak updates after a saved meal.

### Free plan quota

- Confirm Home shows remaining free scans.
- Complete 5 successful food identifications in one local calendar day.
- Confirm the fifth scan can still be completed and saved.
- Attempt a sixth scan.
- Confirm it is blocked with the daily-limit message.
- Delete an earlier meal from Progress.
- Confirm deleting history does not restore a free scan.
- On the next local calendar day, confirm allowance resets to 5.

### Progress

- Confirm last 7 days load.
- Expand days and inspect calories/macros.
- Delete one test scan and confirm the row disappears.
- Pull to refresh.
- Check around local midnight if possible to confirm meals stay on the correct day.

### Learn

- Open Articles and Videos.
- Switch all categories.
- Search a topic.
- Confirm recent live articles appear when the news service is available.
- Confirm article opens inside Alviva.
- Confirm video plays inside Alviva.
- Confirm Back returns to Learn.
- Confirm fallback Health Guides are clearly labelled if live content is unavailable.
- Confirm For You loads without crashing when profile information is incomplete.

### Profile / account controls

- Save and edit Profile.
- Open Privacy Policy.
- Open Terms of Service.
- Open Account deletion help.
- Test in-app Delete Account using a disposable account only.
- Confirm a deleted account can no longer sign in.
- Submit one website deletion request with a disposable test email and confirm it reaches support.

### Device/UX checks

Test on a mix of devices where possible:

- Android 7/8-era compatible device or emulator.
- Android 12/13.
- Android 14/15/16.
- Small screen and large screen.
- Light mode and dark mode.
- Slow/mobile data connection.
- App background → foreground.
- Force-close → reopen while signed in.

Record any crash, frozen loading screen, incorrect date, failed API request, or layout overflow.

## Tester feedback to collect

Ask testers for:

1. Device model and Android version.
2. Which features they tested.
3. Whether food recognition was correct.
4. Whether calorie/portion estimates felt reasonable.
5. Any crash or stuck loading screen.
6. Any confusing button or wording.
7. Whether they would use Alviva weekly.
8. The one feature they most want improved.

## Before applying for production access

- At least 12 testers stayed opted in continuously for 14 days.
- Tester feedback was reviewed and important bugs were fixed.
- Privacy Policy URL works publicly.
- Terms URL works publicly.
- Delete Account URL works publicly.
- Data Safety answers match the actual app.
- Health Apps declaration matches nutrition/weight-management features.
- App access instructions are provided to Google if review needs a login.
- Store screenshots match the current UI.
- Production AAB installs through a Play testing track without a crash.
