const jwt = require('jsonwebtoken');
const accessTokenSecret = 'supersecret';

const users = [
    {
        username: 'admin',
        pass: 'admin',
        scopes: ['read:subs','write:subs']
    },
    {
        username: 'dealer',
        pass: 'dealer',
        scopes: []
    }
];

module.exports.login = (username,pass) => {
    const user = users.filter(e=>e.username === username && e.pass === pass);
    if(user.length > 0){
        return jwt.sign({ username: user[0].username,  role: user[0].scopes }, accessTokenSecret);
    } else {
        throw new Error('Wrong email or password')
    }
}

module.exports.authenticate = (token) => {
    const result = jwt.verify(token, accessTokenSecret);
    return result;
}



