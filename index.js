const [{ Server: h1 }, x] = [require('http'), require('express')];

const Router = x.Router();
const PORT = 4321;
const { log } = console;
const hu = { 'Content-Type': 'text/html; charset=utf-8' };
const app = x();

const bodyParser = require('body-parser');
const session = require('express-session');
const { u: User }	= require('./models/User');

Router
	.route('/')
	.get(r => r.res.end('Марина Кривцун: Привет мир!'))
app
	.use((r, rs, n) => rs.status(200).set(hu) && n())
	.use(x.static('.'))

	// Adding as instructed
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({ extended: true }))
	.use(session({ secret: 'mysecret', resave: true, saveUninitialized: true }))
	// end

	.use('/', Router)
	.use(({ res: r }) => r.status(404).end('Пока нет!'))
	.use((e, r, rs, n) => rs.status(500).end(`Ошибка: ${e}`))
	.set('view engine', 'pug')
	.set('x-powered-by', false);

// Adding as instructed

// middleware function to check if user is logged in
const checkAuth = (req, res, next) => {
	if (req.session.auth === 'ok') {
		next();
	} else {
		res.redirect('/login');
	}
};

// localhost:4321/login, localhost:4321/profile, etc.
Router
	.get('/login', r => r.res.render('login'))
	.post('/login/check', async r => {
		const { body: { login } } = r;
		const user = await User.findOne({ login });

		if (user) {
			if (user.password === r.body.pass) {
				r.session.auth = 'ok';
				r.session.login = login;
				r.res.send('Authorization success');
			} else {
				r.res.send('Incorrect password');
			}
		} else {
			r.res.send('No such user');
		}
	})
	.get('/profile', checkAuth, r => r.res.send(r.session.login));
// end

/* TASK:
 * create /logout route to cancel session
 *		+++ done, lines 76-80
 * create /users route for authorized users only
 *		+++ done, lines 81-88
 * 	create a template to display a table with all user: password pairs
 *			+++ done in ./views/users.pug
 * add start script
 * 	+++ done in package.json (lines 13-15)
 */
Router
	 .get('/logout', (req, res) => {
		 req.session.auth = null;
		 req.session.login = null;
		 res.redirect('/login');
	 })
	 .get('/users', checkAuth, async (req, res) => {
		 const allUsers = await User.find({});

		 if (allUsers)
			res.render('users', { users: allUsers });
		else
			res.send('No users');
	 });

const s = h1(app)
	.listen(process.env.PORT || PORT, () => log(process.pid));
