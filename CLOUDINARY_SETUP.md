# Cloudinary Setup Guide for DriveEase

## Quick Start (5 minutes)

### 1. Create Cloudinary Account
Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) and sign up for a free account.

### 2. Get Your Cloud Name
1. After signup, you'll see your Dashboard
2. Look for "Cloud Name" at the top (looks like: `d1a2b3c4d`)
3. Copy this value

### 3. Create Upload Preset
1. Click the **Settings** icon (gear) at the bottom right
2. Go to **Upload** tab
3. Scroll down to **Upload presets**
4. Click **"Add upload preset"**
5. Fill in:
   - **Name**: `driveease-cars`
   - **Mode**: Change from "Signed" to **"Unsigned"** (toggle)
   - **Folder**: `driveease` (optional)
6. Scroll down and click **"Save"**

### 4. Configure Environment Variables
Add to your `.env.local` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=driveease-cars
```

**Example:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz1abc2
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=driveease-cars
```

### 5. Restart Development Server
```bash
npm run dev
```

### 6. Test It Out
1. Go to **Admin Dashboard** → **Cars**
2. Click **"+ Add Car"** button
3. Upload an image
4. Open browser DevTools (F12) → Console
5. Look for `[CLOUDINARY]` logs to confirm upload

## Troubleshooting

### Issue: "Cloudinary configuration missing"
**Solution**: Check that both environment variables are set correctly in `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=... (should be a string like d1a2b3c4d)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=... (should be driveease-cars)
```

### Issue: "Upload failed" error
**Solutions**:
1. Check internet connection
2. Verify upload preset is set to **"Unsigned"** mode
3. Image file size not > 10MB
4. Try uploading a different image file

### Issue: Image uploads but doesn't appear
**Solution**: Check browser console for `[CLOUDINARY-ERROR]` logs. The URL may not be loading in the Firestore database properly.

## File Size Limits

- **Free Tier**: Up to 10MB per file
- **Pro Tier**: Up to 100MB per file (if upgraded)

Current app setting: **10MB max per image** ✅

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| Storage | 25 GB |
| Monthly Bandwidth | 25 GB |
| Transformations | Unlimited |
| Monthly API Calls | 40,000 |
| Monthly Upload Calls | 40,000 |

For a rental car site with ~100 cars × 3 images = 300MB, you're well within the free tier!

## Managing Images in Cloudinary Dashboard

1. Go to **Media Library** tab in Cloudinary
2. Browse all uploaded images
3. Images are organized in `driveease/cars/` folder
4. You can delete, rename, or edit images directly

## FAQ

**Q: Can I switch back to Firebase Storage?**
A: Yes! The code can be reverted. Firebase Storage would require Firebase service account credentials setup, which is more complex for free tier.

**Q: Are images publicly accessible?**
A: Yes, Cloudinary URLs are public by default. This is fine for a car rental catalog.

**Q: Can I add transformations to images?**
A: Yes! Cloudinary URLs support transformations. Example:
```
https://res.cloudinary.com/cloud-name/image/upload/w_400,h_300,c_crop/...
```
(This would resize/crop the image)

**Q: What if I need more storage?**
A: Upgrade to Cloudinary Pro for $99/month, or use multiple cloud storage providers.

## Need Help?

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Community Forum](https://support.cloudinary.com/hc/en-us)
- Check browser console logs with `[CLOUDINARY]` tags for specific errors
