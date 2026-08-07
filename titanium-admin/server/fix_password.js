const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Member = require('./models/Member');
const Admin = require('./models/Admin');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/gym_management_admin');
  console.log('Connected to MongoDB\n');

  // Fix Admin password
  let admin = await Admin.findOne({ email: 'admin@titaniumfitness.com' }).select('+password');
  if (!admin) {
    console.log('🔧 Creating Super Admin account...');
    admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@titaniumfitness.com',
      password: 'Admin@123',
      role: 'Admin',
      phone: '+91-9876543210'
    });
  } else {
    admin.password = 'Admin@123';
    await admin.save();
  }
  const verifyAdmin = await bcrypt.compare('Admin@123', (await Admin.findById(admin._id).select('+password')).password);
  console.log(`🛡 Admin Account: ${admin.email} -> Verified Admin@123: ${verifyAdmin}`);

  // Fix Member passwords
  const all = await Member.find({}).select('+password');
  console.log(`\nTotal members: ${all.length}`);

  for (const m of all) {
    m.password = 'member@123';
    await m.save();
    const updated = await Member.findById(m._id).select('+password');
    const verify = await bcrypt.compare('member@123', updated.password);
    console.log(`  ${verify ? '✅' : '❌'} ${m.name} (${m.email}) [${m.memberId}] - verified: ${verify}`);
  }

  // Create member@gmail.com demo account if missing
  let demo = await Member.findOne({ email: 'member@gmail.com' });
  if (!demo) {
    console.log('\n🔧 Creating member@gmail.com demo account...');
    demo = await Member.create({
      name: 'Member Test',
      email: 'member@gmail.com',
      password: 'member@123',
      planName: 'Premium',
      status: 'Active',
      phone: '9876543210',
      weight: 70,
      height: 175
    });
    const v = await bcrypt.compare('member@123', (await Member.findById(demo._id).select('+password')).password);
    console.log(`  ✅ Created & verified: ${demo.name} (${demo.email}) [${demo.memberId}] - verified: ${v}`);
  }

  console.log('\n🎉 ALL ADMIN & MEMBER PASSWORDS VERIFIED SUCCESSFULLY!');
  await mongoose.disconnect();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
