# MutPark Test Account Information

> **⚠️ Development/Testing Only**
> These accounts are for development and testing purposes only. Do not use in production.

## 🔐 Admin Accounts

### Super Admin (Highest Privilege)
- **Email**: `mutpark01@gmail.com`
- **Password**: `Hannah@309`
- **Role**: `SUPER_ADMIN` (All permissions)
- **Access URL**: `/ko/auth/login` (unified login - auto-redirects to admin dashboard)
- **Purpose**: System administration, admin account management, system settings

### General Admin
- **Email**: `admin@mutpark.com`
- **Password**: (Placeholder hash in seed data)
- **Role**: `ADMIN`
- **Purpose**: Product, order, and content management

## 👥 Customer Test Accounts (For Community Testing)

### Test User 1
- **Email**: `kimturkey@example.com`
- **Name**: `김터키` (Kim Turkey)
- **Role**: `CUSTOMER`
- **Purpose**: Community post creation testing

### Test User 2
- **Email**: `istanbulkim@example.com`
- **Name**: `이스탄불김씨` (Istanbul Kim)
- **Role**: `CUSTOMER`
- **Purpose**: Community interaction testing

### Test User 3
- **Email**: `ankarakorean@example.com`
- **Name**: `앙카라한국인` (Ankara Korean)
- **Role**: `CUSTOMER`
- **Purpose**: Community diversity testing

## 🚀 Unified Login System

### Single Login Entry Point
- **URL**: `/ko/auth/login` (Korean) or `/tr/auth/login` (Turkish) or `/en/auth/login` (English)
- **Automatic Redirect**: Based on user role after successful login
  - **Admin/Super Admin/Moderator/Operator**: → `/admin/dashboard`
  - **Customer**: → `/{locale}` (main page)

### Features
- **Password visibility toggle**: Eye icon to show/hide password
- **Role-based authentication**: Same login form for all users
- **Automatic session management**: JWT for admins, regular sessions for customers
- **Audit logging**: Admin logins are automatically logged

## 🚀 Developer Guidelines

### Before Creating New Accounts
1. **Check existing accounts first**: Use the accounts listed above
2. **Choose role-appropriate accounts**: Select accounts with appropriate permissions for testing
3. **Consistent passwords**: Use simple and consistent passwords for development accounts
4. **Use unified login**: All users (admin/customer) use the same login page

### When Adding New Test Accounts
If you need new test accounts, add them to `prisma/seed.mjs` in this format:

```javascript
// Example: Adding new test user
await prisma.user.upsert({
  where: { email: "test@example.com" },
  update: {},
  create: {
    email: "test@example.com",
    passwordHash: "$2a$10$...", // bcrypt hash
    name: "Test User",
    role: "CUSTOMER",
    locale: "ko",
    currency: "TRY",
  }
});
```

### Password Hash Generation
```bash
node -e "
const bcrypt = require('bcryptjs');
const password = 'YourPassword';
bcrypt.hash(password, 10, (err, hash) => {
  console.log(hash);
});
"
```

## 📊 Permission System

### SUPER_ADMIN
- ✅ Access to all features
- ✅ Create/delete admin accounts
- ✅ Modify system settings
- ✅ View audit logs

### ADMIN
- ✅ Order, product, customer management
- ✅ Content and banner management
- ✅ View and generate reports
- ❌ System settings, admin account management

### MODERATOR
- ✅ Community post management
- ✅ Review approval/rejection
- ✅ Handle reports
- ❌ Product, order management

### OPERATOR
- ✅ Change order status
- ✅ Inventory management
- ✅ Shipping processing
- ❌ System settings, customer management

### CUSTOMER
- ✅ Shopping, ordering, payment
- ✅ Community participation
- ✅ Review writing
- ❌ Admin feature access

## 🔄 Account Reset

To reset the database and recreate test accounts:

```bash
npm run db:reset
npm run db:seed
```

## 📝 Database Seed Information

The following accounts are automatically created when running `npm run db:seed`:

### Admin Accounts Created by Seed
- Super Admin: `mutpark01@gmail.com` (password: `Hannah@309`)
- Regular Admin: `admin@mutpark.com` (placeholder password)

### Community Test Users Created by Seed
- `kimturkey@example.com` - for recipe and tip posts
- `istanbulkim@example.com` - for review posts
- `ankarakorean@example.com` - for question posts

### Sample Data Included
- 6 sample products (Korean food items)
- 8 community posts (recipes, reviews, tips, questions)
- 5 cultural events (seasonal Korean events)
- Post likes and interactions

---

> **💡 For AI Developers**
> When developing new features, use these existing accounts for testing. Only add new accounts when absolutely necessary, and update this document when account information changes.