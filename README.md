### App Icon

<div align="center"> <img src="assets/screens/icon.png" width="120" /> <h3>SupaSnap</h3> <p> A snap-sharing app built with Expo (React Native) and Supabase.<br/> Capture photos/videos with filters and share instantly with friends.<br/> Supports i18n based on device language. </p> </div>

### App Demo
<div align="center"> <img src="assets/supasnap.gif" width="300" />

<br/>

#### note: demo is also available [here](https://www.bandhanmajumder.com/) at the projects preview section

 </div>

## Screens

### Auth & Onboarding screen

<div align="center"> <img src="assets/screens/landing.png" width="22%" /> <img src="assets/screens/auth.png" width="22%" /> <img src="assets/screens/username.png" width="22%" /> <img src="assets/screens/permission.png" width="22%" /> </div>

### Camera & Sharing

<div align="center"> <img src="assets/screens/camera.png" width="22%" /> <img src="assets/screens/record.png" width="22%" /> <img src="assets/screens/preview.png" width="22%" /> <img src="assets/screens/share-snap.png" width="22%" /> </div>

### Chat

<div align="center"> <img src="assets/screens/chat.png" width="22%" /> <img src="assets/screens/chat-keyboard.png" width="22%" /> <img src="assets/screens/chat-list.png" width="22%" /> <img src="assets/screens/chat-search.png" width="22%" /> </div>

### Profile screen

<div align="center"> <img src="assets/screens/profile.png" width="30%" /> <img src="assets/screens/profile-file-upload.png" width="30%" /> </div>

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```
2. Setup .env.local

   ```bash
   cp .env.example .env.local
   ```

3. Setup supabase locally and setup the credentials (reference: see [docs](https://supabase.com/docs/guides/local-development/cli/getting-started))

4. Reset the db

```bash
supabase db reset
```

5. Edit the `messages` table to support realtime via the UI

6. Start the app

   ```bash
   npx expo start

   # or

   yarn android
   ```