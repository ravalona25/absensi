const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// 📌 Koneksi MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/absensi_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error(err));

// 📌 Schema & Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String // disimpan hash
});
const User = mongoose.model('User', UserSchema);

const AbsensiSchema = new mongoose.Schema({
  nim: String,
  nama: String,
  tanggal: String,
  jam_masuk: String,
  jam_keluar: String,
  status: String
});
const Absensi = mongoose.model('Absensi', AbsensiSchema);

//
// 👤 Login & User Routes
//

// 🔷 Seed admin user jika belum ada
async function seedAdmin() {
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    const hash = await bcrypt.hash('admin', 10);
    await User.create({ username: 'admin', password: hash });
    console.log('🔷 Admin user dibuat (username: admin, password: admin)');
  }
}
seedAdmin();

// 🔷 Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login success' });
});

//
// 📋 Absensi Routes
//

// GET all
app.get('/absensi', async (req, res) => {
  const data = await Absensi.find();
  res.json(data);
});

// GET one
app.get('/absensi/:id', async (req, res) => {
  try {
    const data = await Absensi.findById(req.params.id);
    if (!data) return res.status(404).send('Not Found');
    res.json(data);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// POST new
app.post('/absensi', async (req, res) => {
  const absensi = new Absensi(req.body);
  await absensi.save();
  res.status(201).json(absensi);
});

// PUT update
app.put('/absensi/:id', async (req, res) => {
  try {
    const data = await Absensi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).send('Not Found');
    res.json(data);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// DELETE
app.delete('/absensi/:id', async (req, res) => {
  try {
    const data = await Absensi.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).send('Not Found');
    res.send('Deleted');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//
// 🚀 Start Server
//

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
