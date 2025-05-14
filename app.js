const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const session = require('express-session');

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Sample data
const categories = [
  { id: 1, name: "Graphics & Design", icon: "palette" },
  { id: 2, name: "Digital Marketing", icon: "chart-line" },
  { id: 3, name: "Writing & Translation", icon: "pen" },
  { id: 4, name: "Video & Animation", icon: "video" },
  { id: 5, name: "Music & Audio", icon: "music" },
  { id: 6, name: "Programming", icon: "code" },
  { id: 7, name: "Business", icon: "briefcase" },
  { id: 8, name: "Lifestyle", icon: "heart" }
];

const jobs = [
  {
    id: 1,
    title: "Website Design",
    category: 1,
    price: "Starting at Rs.1500",
    description: "I will design a responsive website...",
    seller: "designPro",
    rating: 4.9,
    image: "webdesign.jpg"
  },
  {
    id: 2,
    title: "Logo Design",
    category: 1,
    price: "Starting at Rs.2500",
    description: "Professional logo design with unlimited revisions...",
    seller: "logoMaster",
    rating: 4.8,
    image: "logo.jpg"
  }
];

// In-memory user storage
const users = [];

// Routes

app.get('/', (req, res) => {
  res.render('index', {
    categories,
    popularJobs: jobs.slice(0, 6),
    pageTitle: 'Freelancer Marketplace'
  });
});

app.get('/jobs', (req, res) => {
  const categoryId = req.query.category ? parseInt(req.query.category) : null;
  let filteredJobs = jobs;
  if (categoryId) {
    filteredJobs = jobs.filter(job => job.category === categoryId);
  }
  res.render('jobs', {
    jobs: filteredJobs,
    categories,
    selectedCategory: categoryId,
    pageTitle: 'Browse Jobs'
  });
});

app.get('/job/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find(job => job.id === jobId);
  if (!job) return res.status(404).send('Job not found');
  res.render('job-details', {
    job,
    categories,
    relatedJobs: jobs.filter(j => j.category === job.category && j.id !== job.id).slice(0, 3),
    pageTitle: job.title
  });
});

app.get('/search', (req, res) => {
  const query = req.query.query || '';
  const results = jobs.filter(job =>
    job.title.toLowerCase().includes(query.toLowerCase()) ||
    job.description.toLowerCase().includes(query.toLowerCase())
  );
  res.render('search-results', {
    results,
    query,
    pageTitle: 'Search Results'
  });
});

// Role selection
app.get('/selectRole', (req, res) => {
  res.render('selectRole', { message: '', username: '' });
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup', { message: '', username: '' });
});

app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.render('signup', { message: 'All fields are required', username });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.render('signup', { message: 'Username already taken', username });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });

    // Store session and redirect to user details form
    req.session.user = { username, role };
    res.redirect('/user-details');
  } catch (err) {
    console.error(err);
    res.render('signup', { message: 'Server error, please try again', username });
  }
});

// User details form (after signup)
app.get('/user-details', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { username, role } = req.session.user;
  res.render('userDetails', { username, role });
});

app.post('/submit-details', (req, res) => {
  const { username, role, name, address, phone, extraInfo } = req.body;

  // Here you could save user details in DB

  res.send(`
    <h2>Thank you, ${name}!</h2>
    <p>You are registered as a <strong>${role}</strong>.</p>
    <p>Address: ${address}</p>
    <p>Phone: ${phone}</p>
    <p>Extra Info: ${extraInfo}</p>
  `);
});

// Login
app.get('/login', (req, res) => {
  res.render('login', { message: '', username: '' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.render('login', { message: 'Invalid username or password', username });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.render('login', { message: 'Invalid username or password', username });
  }

  req.session.user = { username: user.username, role: user.role };

  if (user.role === 'recruiter') {
    res.redirect('/recruiter-dashboard');
  } else {
    res.redirect('/freelancer-dashboard');
  }
});

// Dashboards
app.get('/recruiter-dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'recruiter') {
    return res.redirect('/login');
  }
  res.send(`<h1>Welcome ${req.session.user.username}! You are logged in as a Recruiter.</h1>`);
});

app.get('/freelancer-dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'freelancer') {
    return res.redirect('/login');
  }
  res.send(`<h1>Welcome ${req.session.user.username}! You are logged in as a Freelancer.</h1>`);
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
