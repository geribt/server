import jsonwebtoken from 'jsonwebtoken';

const  secretKey = "setze-jutges"

const autentica = (req, res, next) => {
	let token = req.headers.authorization || '';

	if (!token) {
		res.json({ error: 'no token' });
	} 
    token = token.split(' ')[1];

	jsonwebtoken.verify(token, secretKey, (error, decoded) => {
		if (error) {
			res.json({ error: 'token no serveix' });
		} else {
			const { expiredAt } = decoded;
			if (expiredAt > new Date().getTime()) {
				next();
			} else {
				res.json({ error: 'token caducat' });
			}
		}
	});
};

const autError = (err, req, res, next) => {
	res.status(400).json(err);
};


//export { autentica, autError };
export default autentica;
