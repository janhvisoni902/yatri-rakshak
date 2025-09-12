const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yatri-rakshak';

const demoUsers = [
  {
    name: 'Tourist Demo User',
    email: 'tourist@demo.com',
    password: 'demo123',
    role: 'public',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Tourist Demo User',
        dateOfBirth: '1990-01-01',
        nationality: 'Indian',
        address: 'Demo Address, Mumbai, Maharashtra'
      },
      identityDocument: {
        type: 'passport',
        number: 'DEMO123456',
        expiryDate: '2030-12-31'
      },
      travelInfo: {
        purposeOfVisit: 'tourism',
        duration: '7 days',
        accommodation: 'Hotel Demo Plaza'
      }
    }
  },
  {
    name: 'Police Officer Demo',
    email: 'police@demo.com',
    password: 'demo123',
    role: 'police_officer',
    badgeNumber: 'PD001',
    department: 'Mumbai Police',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Police Officer Demo',
        dateOfBirth: '1985-05-15',
        nationality: 'Indian',
        address: 'Police Quarters, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'POLICE001',
        expiryDate: '2030-12-31'
      },
      policeInfo: {
        rank: 'Inspector',
        station: 'Colaba Police Station',
        yearsOfService: '10'
      }
    }
  },
  {
    name: 'Tourism Authority Demo',
    email: 'authority@demo.com',
    password: 'demo123',
    role: 'tourism_department',
    department: 'Maharashtra Tourism',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Tourism Authority Demo',
        dateOfBirth: '1980-03-20',
        nationality: 'Indian',
        address: 'Tourism Office, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'TOUR001',
        expiryDate: '2030-12-31'
      }
    }
  },
  {
    name: 'Admin Demo User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'higher_authority',
    department: 'System Administration',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Admin Demo User',
        dateOfBirth: '1975-08-10',
        nationality: 'Indian',
        address: 'Admin Office, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'ADMIN001',
        expiryDate: '2030-12-31'
      }
    }
  },
  {
    name: 'Local Citizen Demo',
    email: 'citizen@demo.com',
    password: 'demo123',
    role: 'local_citizen',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Local Citizen Demo',
        dateOfBirth: '1992-12-05',
        nationality: 'Indian',
        address: 'Resident Address, Mumbai'
      },
      identityDocument: {
        type: 'aadhaar',
        number: 'CITIZEN001',
        expiryDate: '2030-12-31'
      }
    }
  }
];

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Clear existing demo users
    await usersCollection.deleteMany({ 
      email: { $in: demoUsers.map(user => user.email) } 
    });
    console.log('Cleared existing demo users');
    
    // Hash passwords and insert users
    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const userDoc = {
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(userDoc);
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('Demo users seeded successfully!');
    console.log('\nDemo Credentials:');
    demoUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / demo123`);
    });
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers, demoUsers };
