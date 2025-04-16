const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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
    description: "I will design a responsive website with modern UI/UX principles. The design includes up to 5 pages with revisions. The final delivery includes Figma files and design assets ready for development.",
    seller: "designPro",
    rating: 4.9,
    image: "webdesign.jpg"
  },
  {
    id: 2,
    title: "Logo Design",
    category: 1,
    price: "Starting at Rs.2500",
    description: "Professional logo design with unlimited revisions. I'll create a unique brand identity that perfectly represents your business. Package includes source files in multiple formats and a brand guidelines document.",
    seller: "logoMaster",
    rating: 4.8,
    image: "logo.jpg"
  },
];

app.get('/', (req, res) => {
  res.render('index', { 
    categories: categories,
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
    categories: categories,
    selectedCategory: categoryId,
    pageTitle: 'Browse Jobs'
  });
});

app.get('/job/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find(job => job.id === jobId);
  
  if (!job) {
    return res.status(404).send('Job not found');
  }
  
  res.render('job-details', { 
    job: job,
    categories: categories,
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
    results: results,
    query: query,
    pageTitle: 'Search Results'
  });
});

  
  app.get('/login', (req, res) => {
    res.render('login', { message: '', username: '' });
  });
  
  app.post('/select-role', (req, res) => {
    const { username, password } = req.body;
  
    if (username === 'admin' && password === '1234') {
      res.render('selectRole', { username });
    } else {
      res.render('login', {
        message: 'Invalid credentials',
        username
      });
    }
  });
  
  app.get('/select-role', (req, res) => {
    const username = 'admin';
    res.render('selectRole', { username });
  });
  
  app.post('/dashboard', (req, res) => {
    const { username, role } = req.body;
    res.send(`<h1>Welcome ${username}! You are logged in as a ${role}.</h1>`);
  });

  app.post('/user-details', (req, res) => {
    const { username, role } = req.body;
    res.render('userDetails', { username, role });
  });
  
  app.post('/submit-details', (req, res) => {
    const { username, role, name, address, phone, extraInfo } = req.body;
    res.send(`<h2>Thank you ${name}!<br>You are registered as a ${role}.<br>Details submitted successfully.</h2>`);
  });
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
