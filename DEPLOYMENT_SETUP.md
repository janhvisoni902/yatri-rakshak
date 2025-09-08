# Production Deployment Setup Guide

## 1. MongoDB Atlas Setup

### Create Free MongoDB Atlas Database:
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project named "YatriRakshak"
4. Click "Build a Database" → Select M0 Sandbox (Free)
5. Choose your preferred cloud provider and region
6. Name your cluster: `yatrirakshak-prod`

### Configure Database User:
1. Go to Database Access → Add New Database User
2. Choose Username/Password authentication
3. Username: `yatrirakshak-user`
4. Generate a strong password (save it securely)
5. Grant "Read and write to any database" role

### Configure Network Access:
1. Go to Network Access → Add IP Address
2. Click "Allow access from anywhere" (0.0.0.0/0)
3. This allows Vercel's servers to access your database

### Get Connection String:
1. Go to Database → Connect → Connect your application
2. Choose Node.js driver
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<database>` with `yatrirakshak`

Example URI format:
```
mongodb+srv://yatrirakshak-user:YOUR_PASSWORD@yatrirakshak-prod.xxxxx.mongodb.net/yatrirakshak?retryWrites=true&w=majority
```

## 2. Vercel Environment Variables

### Add these variables in your Vercel dashboard (Settings → Environment Variables):

#### NextAuth Configuration:
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `05b94c5c7fdc42606d83e4072f81cd80684c1cc02b48c5ff573e168c468848a452c363b99c49c1a21a1617b6992ffd4385b52f2b0d1ed3be0dc32ebb0ff753d8`
- **Environment:** Production

- **Name:** `NEXTAUTH_URL`
- **Value:** `https://your-app-name.vercel.app` (replace with your actual Vercel URL)
- **Environment:** Production

#### Database Configuration:
- **Name:** `MONGODB_URI`
- **Value:** Your MongoDB Atlas connection string from step 1
- **Environment:** Production

- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production

## 3. Pre-deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured to allow Vercel
- [ ] Connection string obtained and tested
- [ ] All environment variables added to Vercel
- [ ] NextAuth URL updated to match your Vercel domain

## 4. Testing the Setup

After deployment, test the following:
1. Visit your app's sign-in page
2. Try creating a new account
3. Test authentication flow
4. Verify database connections are working

## 5. Security Notes

- The production `NEXTAUTH_SECRET` is different from development
- Database credentials are stored securely in Vercel
- Network access is configured for Vercel's IP ranges
- Always use HTTPS in production (Vercel provides this automatically)

## 6. Troubleshooting

Common issues:
- **Authentication errors:** Check NEXTAUTH_URL matches your domain exactly
- **Database connection errors:** Verify MONGODB_URI and network access settings
- **Session issues:** Ensure NEXTAUTH_SECRET is set and consistent across deployments
