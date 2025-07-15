import { getDatabase } from "./mongodb"
import type { ObjectId } from "mongodb"
import crypto from 'crypto'

// User management
export interface User {
  _id?: ObjectId
  id: string
  name: string
  email: string
  password: string
  role: "superadmin" | "company_admin" | "employee"
  companyName?: string
  coinBalance: number
  createdAt: string
  lastUpdated: string
}

// Coupon management
export interface Coupon {
  _id?: ObjectId
  id: string
  code: string
  value: number
  isUsed: boolean
  userId?: string
  issuedAt: string
  redeemedAt?: string
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const db = await getDatabase()
    const coupons = await db.collection<Coupon>("coupons").find({}).toArray()
    console.log(`✅ Fetched ${coupons.length} coupons from MongoDB`)
    return coupons
  } catch (error) {
    console.error("❌ Error fetching coupons:", error)
    return []
  }
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("coupons").insertOne(coupon)
    console.log(`✅ Saved coupon ${coupon.code} to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving coupon:", error)
    throw error
  }
}

export async function updateCoupon(coupon: Coupon): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("coupons").updateOne({ id: coupon.id }, { $set: coupon })
    console.log(`✅ Updated coupon ${coupon.code}`)
  } catch (error) {
    console.error("❌ Error updating coupon:", error)
    throw error
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const db = await getDatabase()
    const coupon = await db.collection<Coupon>("coupons").findOne({ code: code.toUpperCase() })
    return coupon
  } catch (error) {
    console.error("❌ Error fetching coupon by code:", error)
    return null
  }
}

export async function generateCoupon(value: number): Promise<Coupon> {
  try {
    // Function to generate a random 4-character segment using only A-Z and 0-9
    const generateSegment = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      // Use crypto.randomBytes for cryptographic randomness
      const randomBytes = crypto.randomBytes(4);
      for (let i = 0; i < 4; i++) {
        // Use modulo to map the random byte to a character in our set
        const randomIndex = randomBytes[i] % chars.length;
        result += chars.charAt(randomIndex);
      }
      return result;
    };

    let code: string;
    let existingCoupon: Coupon | null;
    
    // Keep generating codes until we find a unique one
    do {
      // Generate a full 16-character code in the format XXXX-XXXX-XXXX-XXXX
      code = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
      
      // Check if this code already exists in the database
      existingCoupon = await getCouponByCode(code);
    } while (existingCoupon);

    const coupon: Coupon = {
      id: `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      code,                    // 16 alphanumeric characters + 3 dashes = 19-char string
      value,
      isUsed: false,
      issuedAt: new Date().toISOString(),
    }

    await saveCoupon(coupon)
    console.log(`✅ Generated new coupon: ${coupon.code} with value ${value}`)
    return coupon
  } catch (error) {
    console.error("❌ Error generating coupon:", error)
    throw error
  }
}


export async function getUsers(): Promise<User[]> {
  try {
    const db = await getDatabase()
    const users = await db.collection<User>("users").find({}).toArray()
    console.log(`✅ Fetched ${users.length} users from MongoDB`)
    return users
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    return []
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  try {
    const db = await getDatabase()
    
    // Update all users with their last updated timestamp
    const updatedUsers = users.map(user => ({
      ...user,
      lastUpdated: new Date().toISOString()
    }));

    // Create bulk operations for updating users
    const bulkOps = updatedUsers.map(user => {
      if (user._id) {
        return {
          updateOne: {
            filter: { _id: user._id },
            update: { $set: user }
          }
        };
      } else {
        return {
          updateOne: {
            filter: { id: user.id },
            update: { $set: user },
            upsert: true
          }
        };
      }
    });

    if (bulkOps.length > 0) {
      await db.collection("users").bulkWrite(bulkOps);
    }
    console.log(`✅ Saved ${users.length} users to MongoDB`);
  } catch (error) {
    console.error("❌ Error saving users:", error);
    throw error;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    const db = await getDatabase()
    user.lastUpdated = new Date().toISOString()

    if (user._id) {
      await db.collection("users").updateOne({ _id: user._id }, { $set: user })
    } else {
      await db.collection("users").insertOne(user)
    }
    console.log(`✅ Saved user ${user.email} to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>("users").findOne({ email })
    return user
  } catch (error) {
    console.error("❌ Error fetching user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>("users").findOne({ id })
    return user
  } catch (error) {
    console.error("❌ Error fetching user by id:", error)
    return null
  }
}

export async function updateUser(updatedUser: User): Promise<void> {
  try {
    const db = await getDatabase()
    updatedUser.lastUpdated = new Date().toISOString()

    await db.collection("users").updateOne({ id: updatedUser.id }, { $set: updatedUser })
    console.log(`✅ Updated user ${updatedUser.email} with balance: ${updatedUser.coinBalance}`)
  } catch (error) {
    console.error("❌ Error updating user:", error)
    throw error
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt" | "lastUpdated" | "_id">): Promise<User> {
  try {
    const db = await getDatabase()
    const newUser: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    await db.collection("users").insertOne(newUser)
    console.log(`✅ Created new user: ${newUser.email} with balance: ${newUser.coinBalance}`)
    return newUser
  } catch (error) {
    console.error("❌ Error creating user:", error)
    throw error
  }
}

// Voucher management
export interface Voucher {
  _id?: ObjectId
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
  createdAt: string
  createdBy: string
  imageUrl?: string
  featured?: boolean
  brand?: string
  originalPrice?: string
}

// Serialized version of Voucher for client components
export interface SerializedVoucher {
  _id?: string // ObjectId as string for client components
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
  createdAt: string
  createdBy: string
  imageUrl?: string
  featured?: boolean
  brand?: string
  originalPrice?: string
}

export async function getVouchers(): Promise<SerializedVoucher[]> {
  try {
    const db = await getDatabase()
    const vouchers = await db.collection<Voucher>("vouchers").find({}).toArray()
    console.log(`✅ Fetched ${vouchers.length} vouchers from MongoDB`)
    
    // Serialize MongoDB objects to plain JavaScript objects
    const serializedVouchers: SerializedVoucher[] = vouchers.map(voucher => ({
      ...voucher,
      _id: voucher._id ? voucher._id.toString() : undefined, // Convert ObjectId to string
      id: voucher.id,
      title: voucher.title,
      description: voucher.description,
      category: voucher.category,
      coinValue: voucher.coinValue,
      expiryDate: voucher.expiryDate,
      isActive: voucher.isActive,
      createdAt: voucher.createdAt,
      createdBy: voucher.createdBy,
      imageUrl: voucher.imageUrl,
      featured: voucher.featured,
      brand: voucher.brand,
      originalPrice: voucher.originalPrice
    }))
    
    return serializedVouchers
  } catch (error) {
    console.error("❌ Error fetching vouchers:", error)
    return []
  }
}

export async function saveVouchers(vouchers: Voucher[]): Promise<void> {
  try {
    const db = await getDatabase()

    // Clear existing vouchers and insert new ones
    await db.collection("vouchers").deleteMany({})
    if (vouchers.length > 0) {
      await db.collection("vouchers").insertMany(vouchers)
    }
    console.log(`✅ Saved ${vouchers.length} vouchers to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving vouchers:", error)
    throw error
  }
}

export async function saveVoucher(voucher: Voucher): Promise<void> {
  try {
    const db = await getDatabase()

    if (voucher._id) {
      await db.collection("vouchers").updateOne({ _id: voucher._id }, { $set: voucher })
    } else {
      await db.collection("vouchers").insertOne(voucher)
    }
    console.log(`✅ Saved voucher ${voucher.title} to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving voucher:", error)
    throw error
  }
}

export async function deleteVoucher(id: string): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("vouchers").deleteOne({ id })
    console.log(`✅ Deleted voucher ${id} from MongoDB`)
  } catch (error) {
    console.error("❌ Error deleting voucher:", error)
    throw error
  }
}

// Coin transactions
export interface CoinTransaction {
  _id?: ObjectId
  id: string
  type: "add" | "remove" | "request" | "approve" | "purchase" | "redeem_code"
  amount: number
  fromUserId?: string
  toUserId?: string
  description: string
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: string
}

export async function getCoinTransactions(): Promise<CoinTransaction[]> {
  try {
    const db = await getDatabase()
    const transactions = await db.collection<CoinTransaction>("coinTransactions").find({}).toArray()
    console.log(`✅ Fetched ${transactions.length} transactions from MongoDB`)
    return transactions
  } catch (error) {
    console.error("❌ Error fetching transactions:", error)
    return []
  }
}

export async function saveCoinTransaction(transaction: CoinTransaction): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("coinTransactions").insertOne(transaction)
    console.log(`✅ Saved transaction ${transaction.type} to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving transaction:", error)
    throw error
  }
}

export async function saveCoinTransactions(transactions: CoinTransaction[]): Promise<void> {
  try {
    const db = await getDatabase()
    // Delete existing transactions and insert the updated array
    await db.collection("coinTransactions").deleteMany({})
    await db.collection("coinTransactions").insertMany(transactions)
    console.log(`✅ Saved ${transactions.length} transactions to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving transactions:", error)
    throw error
  }
}

export async function addCoinTransaction(
  transaction: Omit<CoinTransaction, "id" | "createdAt" | "_id">,
): Promise<CoinTransaction> {
  try {
    const newTransaction: CoinTransaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    await saveCoinTransaction(newTransaction)
    console.log(`✅ Added transaction: ${newTransaction.type} - ${newTransaction.amount} coins`)
    return newTransaction
  } catch (error) {
    console.error("❌ Error adding transaction:", error)
    throw error
  }
}

export async function updateCoinTransaction(transaction: CoinTransaction): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("coinTransactions").updateOne({ id: transaction.id }, { $set: transaction })
    console.log(`✅ Updated transaction ${transaction.id}`)
  } catch (error) {
    console.error("❌ Error updating transaction:", error)
    throw error
  }
}

// Redemption codes for employees
export interface RedemptionCode {
  _id?: ObjectId
  id: string
  code: string
  coinAmount: number
  employeeEmail: string
  employeeName: string
  companyAdminId: string
  isRedeemed: boolean
  redeemedAt?: string
  // Fields to track who redeemed the code (for audit trail)
  redeemedById?: string
  redeemedByEmail?: string
  createdAt: string
  expiresAt: string
  // Email tracking fields
  emailSent?: boolean
  emailStatus?: string
}

export async function getRedemptionCodes(): Promise<RedemptionCode[]> {
  try {
    const db = await getDatabase()
    const codes = await db.collection<RedemptionCode>("redemptionCodes").find({}).toArray()
    console.log(`✅ Fetched ${codes.length} redemption codes from MongoDB`)
    return codes
  } catch (error) {
    console.error("❌ Error fetching redemption codes:", error)
    return []
  }
}

export async function saveRedemptionCode(code: RedemptionCode): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("redemptionCodes").insertOne(code)
    console.log(`✅ Saved redemption code ${code.code} to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving redemption code:", error)
    throw error
  }
}

export async function saveRedemptionCodes(codes: RedemptionCode[]): Promise<void> {
  try {
    const db = await getDatabase()

    if (codes.length > 0) {
      // Create bulk operations for updating codes
      const bulkOps = codes.map(code => {
        if (code._id) {
          return {
            updateOne: {
              filter: { _id: code._id },
              update: { $set: code }
            }
          };
        } else {
          return {
            updateOne: {
              filter: { id: code.id },
              update: { $set: code },
              upsert: true
            }
          };
        }
      });

      await db.collection("redemptionCodes").bulkWrite(bulkOps);
    }
    console.log(`✅ Saved ${codes.length} redemption codes to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving redemption codes:", error)
    throw error
  }
}

export async function updateRedemptionCode(code: RedemptionCode): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("redemptionCodes").updateOne({ id: code.id }, { $set: code })
    console.log(`✅ Updated redemption code ${code.code}`)
  } catch (error) {
    console.error("❌ Error updating redemption code:", error)
    throw error
  }
}

// Employee voucher purchases
export interface VoucherPurchase {
  _id?: ObjectId
  id: string
  voucherId: string
  employeeId: string
  purchasedAt: string
  redeemedAt?: string
  isRedeemed: boolean
}

export async function getVoucherPurchases(): Promise<VoucherPurchase[]> {
  try {
    const db = await getDatabase()
    const purchases = await db.collection<VoucherPurchase>("voucherPurchases").find({}).toArray()
    console.log(`✅ Fetched ${purchases.length} voucher purchases from MongoDB`)
    return purchases
  } catch (error) {
    console.error("❌ Error fetching voucher purchases:", error)
    return []
  }
}

export async function saveVoucherPurchase(purchase: VoucherPurchase): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("voucherPurchases").insertOne(purchase)
    console.log(`✅ Saved voucher purchase to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving voucher purchase:", error)
    throw error
  }
}

export async function saveVoucherPurchases(purchases: VoucherPurchase[]): Promise<void> {
  try {
    const db = await getDatabase()

    if (purchases.length > 0) {
      await db.collection("voucherPurchases").insertMany(purchases)
    }
    console.log(`✅ Saved ${purchases.length} voucher purchases to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving voucher purchases:", error)
    throw error
  }
}

export async function updateVoucherPurchase(purchase: VoucherPurchase): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("voucherPurchases").updateOne({ id: purchase.id }, { $set: purchase })
    console.log(`✅ Updated voucher purchase ${purchase.id}`)
  } catch (error) {
    console.error("❌ Error updating voucher purchase:", error)
    throw error
  }
}

// Activity logs
export interface ActivityLog {
  _id?: ObjectId
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const db = await getDatabase()
    const logs = await db.collection<ActivityLog>("activityLogs").find({}).toArray()
    console.log(`✅ Fetched ${logs.length} activity logs from MongoDB`)
    return logs
  } catch (error) {
    console.error("❌ Error fetching activity logs:", error)
    return []
  }
}

export async function saveActivityLog(log: ActivityLog): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("activityLogs").insertOne(log)
    console.log(`✅ Saved activity log to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving activity log:", error)
    throw error
  }
}

export async function logActivity(userId: string, action: string, details: string): Promise<void> {
  try {
    const newLog: ActivityLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    }

    await saveActivityLog(newLog)
    console.log(`✅ Logged activity: ${action} - ${details}`)
  } catch (error) {
    console.error("❌ Error logging activity:", error)
  }
}

// Voucher assignments (kept for backward compatibility)
export interface VoucherAssignment {
  _id?: ObjectId
  id: string
  voucherId: string
  employeeId: string
  companyAdminId: string
  assignedAt: string
  redeemedAt?: string
  isRedeemed: boolean
}

export async function getVoucherAssignments(): Promise<VoucherAssignment[]> {
  try {
    const db = await getDatabase()
    const assignments = await db.collection<VoucherAssignment>("voucherAssignments").find({}).toArray()
    console.log(`✅ Fetched ${assignments.length} voucher assignments from MongoDB`)
    return assignments
  } catch (error) {
    console.error("❌ Error fetching voucher assignments:", error)
    return []
  }
}

export async function saveVoucherAssignment(assignment: VoucherAssignment): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("voucherAssignments").insertOne(assignment)
    console.log(`✅ Saved voucher assignment to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving voucher assignment:", error)
    throw error
  }
}

export async function saveVoucherAssignments(assignments: VoucherAssignment[]): Promise<void> {
  try {
    const db = await getDatabase()

    if (assignments.length > 0) {
      await db.collection("voucherAssignments").insertMany(assignments)
    }
    console.log(`✅ Saved ${assignments.length} voucher assignments to MongoDB`)
  } catch (error) {
    console.error("❌ Error saving voucher assignments:", error)
    throw error
  }
}

export async function updateVoucherAssignment(assignment: VoucherAssignment): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection("voucherAssignments").updateOne({ id: assignment.id }, { $set: assignment })
    console.log(`✅ Updated voucher assignment ${assignment.id}`)
  } catch (error) {
    console.error("❌ Error updating voucher assignment:", error)
    throw error
  }
}

// Initialize superadmin user and sample data
export async function initializeSuperadmin(): Promise<void> {
  try {
    const existingSuperadmin = await getUserByEmail("superadmin@gmail.com")

    if (!existingSuperadmin) {
      await createUser({
        name: "Super Admin",
        email: "superadmin@gmail.com",
        password: "superadmin",
        role: "superadmin",
        coinBalance: 100000, // Large initial balance
      })
      console.log("✅ Superadmin initialized with 100,000 coins")
    } else {
      console.log(`✅ Superadmin exists with balance: ${existingSuperadmin.coinBalance}`)
    }

    // Initialize comprehensive brand vouchers if none exist
    const vouchers = await getVouchers()
    if (vouchers.length === 0) {
      const brandVouchers = [
        // Featured Premium Vouchers
        {
          id: "voucher1",
          title: "Amazon Gift Card $25",
          description:
            "Shop millions of products on Amazon with this $25 gift card. Perfect for books, electronics, home goods, and more.",
          category: "Shopping",
          coinValue: 250,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=300&fit=crop",
          featured: true,
          brand: "Amazon",
          originalPrice: "$25.00",
        },
        {
          id: "voucher2",
          title: "Starbucks $10 Gift Card",
          description:
            "Enjoy your favorite coffee, tea, or snack at any Starbucks location worldwide. Valid for 12 months.",
          category: "Food & Beverage",
          coinValue: 100,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
          featured: true,
          brand: "Starbucks",
          originalPrice: "$10.00",
        },
        {
          id: "voucher3",
          title: "Netflix Premium 3 Months",
          description:
            "Stream unlimited movies and TV shows in 4K Ultra HD. Access to Netflix's entire catalog for 3 months.",
          category: "Entertainment",
          coinValue: 450,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
          featured: true,
          brand: "Netflix",
          originalPrice: "$45.00",
        },
        {
          id: "voucher4",
          title: "Spotify Premium 6 Months",
          description: "Ad-free music streaming with offline downloads. Access to over 100 million songs and podcasts.",
          category: "Entertainment",
          coinValue: 600,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop",
          featured: true,
          brand: "Spotify",
          originalPrice: "$60.00",
        },
        {
          id: "voucher5",
          title: "Apple App Store $15",
          description:
            "Purchase apps, games, music, movies, and more from the Apple App Store. Compatible with iPhone, iPad, and Mac.",
          category: "Technology",
          coinValue: 150,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=300&fit=crop",
          featured: true,
          brand: "Apple",
          originalPrice: "$15.00",
        },
        {
          id: "voucher6",
          title: "Google Play Store $20",
          description:
            "Download premium apps, games, movies, and books from Google Play Store. Works on all Android devices.",
          category: "Technology",
          coinValue: 200,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=300&fit=crop",
          featured: true,
          brand: "Google",
          originalPrice: "$20.00",
        },

        // Food & Beverage
        {
          id: "voucher7",
          title: "McDonald's Big Mac Meal",
          description: "Enjoy a classic Big Mac meal with fries and drink at any McDonald's restaurant worldwide.",
          category: "Food & Beverage",
          coinValue: 80,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
          featured: false,
          brand: "McDonald's",
          originalPrice: "$8.00",
        },
        {
          id: "voucher8",
          title: "Subway Footlong Sub",
          description: "Choose any footlong sub with your favorite toppings at participating Subway locations.",
          category: "Food & Beverage",
          coinValue: 90,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400&h=300&fit=crop",
          featured: false,
          brand: "Subway",
          originalPrice: "$9.00",
        },
        {
          id: "voucher9",
          title: "Domino's Large Pizza",
          description: "Order any large pizza with up to 3 toppings from Domino's. Delivery or pickup available.",
          category: "Food & Beverage",
          coinValue: 150,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
          featured: false,
          brand: "Domino's",
          originalPrice: "$15.00",
        },

        // Transportation
        {
          id: "voucher10",
          title: "Uber Ride Credit $15",
          description: "Get $15 credit for Uber rides in your city. Perfect for commuting or weekend trips.",
          category: "Transportation",
          coinValue: 150,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
          featured: false,
          brand: "Uber",
          originalPrice: "$15.00",
        },
        {
          id: "voucher11",
          title: "Lyft Ride Credit $20",
          description:
            "Enjoy convenient rides with Lyft. $20 credit can be used for multiple trips or one longer journey.",
          category: "Transportation",
          coinValue: 200,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
          featured: false,
          brand: "Lyft",
          originalPrice: "$20.00",
        },

        // Gaming
        {
          id: "voucher12",
          title: "Steam Wallet $25",
          description:
            "Add $25 to your Steam wallet to purchase games, DLC, and in-game items from the world's largest gaming platform.",
          category: "Gaming",
          coinValue: 250,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
          featured: false,
          brand: "Steam",
          originalPrice: "$25.00",
        },
        {
          id: "voucher13",
          title: "PlayStation Store $30",
          description: "Purchase games, add-ons, and PlayStation Plus subscriptions from the PlayStation Store.",
          category: "Gaming",
          coinValue: 300,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
          featured: false,
          brand: "PlayStation",
          originalPrice: "$30.00",
        },
        {
          id: "voucher14",
          title: "Xbox Game Pass 3 Months",
          description:
            "Access over 100 high-quality games on Xbox console, PC, and mobile devices with Xbox Game Pass Ultimate.",
          category: "Gaming",
          coinValue: 450,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop",
          featured: false,
          brand: "Xbox",
          originalPrice: "$45.00",
        },

        // Health & Fitness
        {
          id: "voucher15",
          title: "Planet Fitness 1 Month",
          description:
            "One month unlimited access to Planet Fitness gyms nationwide. Includes all basic amenities and equipment.",
          category: "Health & Fitness",
          coinValue: 200,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
          featured: false,
          brand: "Planet Fitness",
          originalPrice: "$20.00",
        },
        {
          id: "voucher16",
          title: "Yoga Studio 5 Classes",
          description:
            "Attend 5 yoga classes at participating studios. Perfect for beginners and experienced practitioners.",
          category: "Health & Fitness",
          coinValue: 250,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
          featured: false,
          brand: "Local Yoga Studios",
          originalPrice: "$25.00",
        },

        // Fashion & Beauty
        {
          id: "voucher17",
          title: "Nike Store $40",
          description: "Shop the latest Nike shoes, apparel, and accessories. Valid at Nike stores and online.",
          category: "Fashion",
          coinValue: 400,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
          featured: false,
          brand: "Nike",
          originalPrice: "$40.00",
        },
        {
          id: "voucher18",
          title: "Sephora Beauty $35",
          description:
            "Discover the latest in beauty and skincare at Sephora. Choose from thousands of premium brands.",
          category: "Beauty",
          coinValue: 350,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
          featured: false,
          brand: "Sephora",
          originalPrice: "$35.00",
        },

        // Books & Education
        {
          id: "voucher19",
          title: "Barnes & Noble $20",
          description: "Purchase books, magazines, games, and gifts at Barnes & Noble bookstores or online.",
          category: "Education",
          coinValue: 200,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
          featured: false,
          brand: "Barnes & Noble",
          originalPrice: "$20.00",
        },
        {
          id: "voucher20",
          title: "Audible 2 Months Free",
          description:
            "Listen to thousands of audiobooks and podcasts with 2 months of Audible Premium Plus membership.",
          category: "Education",
          coinValue: 300,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
          featured: false,
          brand: "Audible",
          originalPrice: "$30.00",
        },

        // Premium Experience Vouchers
        {
          id: "voucher21",
          title: "Movie Theater Premium Experience",
          description: "Two premium movie tickets with reserved seating and complimentary popcorn and drinks.",
          category: "Entertainment",
          coinValue: 350,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1489185078254-c3365d6e359f?w=400&h=300&fit=crop",
          featured: false,
          brand: "AMC Theaters",
          originalPrice: "$35.00",
        },
        {
          id: "voucher22",
          title: "Spa Day Relaxation Package",
          description: "Full day spa experience including massage, facial, and access to wellness facilities.",
          category: "Health & Wellness",
          coinValue: 800,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
          featured: true,
          brand: "Premium Spas",
          originalPrice: "$80.00",
        },
        {
          id: "voucher23",
          title: "Fine Dining Experience",
          description: "Three-course meal for two at a premium restaurant. Wine pairing included.",
          category: "Food & Beverage",
          coinValue: 1000,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
          featured: true,
          brand: "Premium Restaurants",
          originalPrice: "$100.00",
        },
        {
          id: "voucher24",
          title: "Weekend Getaway Hotel",
          description:
            "Two nights at a 4-star hotel including breakfast and late checkout. Perfect for a weekend escape.",
          category: "Travel",
          coinValue: 1500,
          expiryDate: "2024-12-31T23:59:59.000Z",
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "superadmin",
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
          featured: true,
          brand: "Premium Hotels",
          originalPrice: "$150.00",
        },
      ]

      await saveVouchers(brandVouchers)
      console.log("✅ Comprehensive brand vouchers with images initialized in MongoDB")
    }
  } catch (error) {
    console.error("❌ Error initializing superadmin:", error)
  }
}

// Generate unique redemption code with 16 characters in XXXX-XXXX-XXXX-XXXX format
export async function generateRedemptionCode(): Promise<string> {
  try {
    // Function to generate a random 4-character segment using only A-Z and 0-9
    const generateSegment = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      // Use crypto.randomBytes for cryptographic randomness
      const randomBytes = crypto.randomBytes(4);
      for (let i = 0; i < 4; i++) {
        // Use modulo to map the random byte to a character in our set
        const randomIndex = randomBytes[i] % chars.length;
        result += chars.charAt(randomIndex);
      }
      return result;
    };

    let code: string;
    let existingCode: RedemptionCode | null;
    
    // Keep generating codes until we find a unique one
    do {
      // Generate a full 16-character code in the format XXXX-XXXX-XXXX-XXXX
      code = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
      
      // Check if this code already exists in the database
      const db = await getDatabase();
      existingCode = await db.collection<RedemptionCode>("redemptionCodes").findOne({ code: code });
    } while (existingCode);

    return code;
  } catch (error) {
    console.error("❌ Error generating redemption code:", error);
    throw error;
  }
}

// Debug helper function to get data directory information
export function debugDataDirectory(): void {
  console.log(`✅ Data directory: ${process.cwd()}/data`)
}

// Helper function to transfer coins between users
export async function transferCoins(
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string,
): Promise<void> {
  try {
    const fromUser = await getUserById(fromUserId)
    const toUser = await getUserById(toUserId)

    if (!fromUser || !toUser) {
      throw new Error("User not found")
    }

    if (fromUser.coinBalance < amount) {
      throw new Error("Insufficient coins")
    }

    // Transfer coins
    fromUser.coinBalance -= amount
    toUser.coinBalance += amount

    await updateUser(fromUser)
    await updateUser(toUser)

    // Log transaction
    await addCoinTransaction({
      type: "approve",
      amount,
      fromUserId,
      toUserId,
      description,
      status: "completed",
    })

    console.log(`✅ Transferred ${amount} coins from ${fromUser.email} to ${toUser.email}`)
  } catch (error) {
    console.error("❌ Error transferring coins:", error)
    throw error
  }
}
