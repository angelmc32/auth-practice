const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User')

/* GET home page */


router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  console.log(req.body);
  const { password, email } = req.body;

  const bcryptSalt = 10;
  
  let error;

  if(!email || !password) {
    error = 'Please make sure to enter e-mail and password';
    return res.render('signup', { error });
  }
  if( req.body.password !== req.body['confirm-password'] ) {
    error = 'Please make sure to confirm the password correctly';
    return res.render('signup', { error });
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  User.findOne({email})
  .then( user => {
    if(user) {
      error = 'There is an user registered with that e-mail'
      return res.render('signup', error)
    }
    User.create({ email, password: hashPass })
    .then( user => {
      console.log('User created');
      res.redirect('/login');
    });
  });
  //res.render('signup');
});

router.get('/login', (req, res, next) =>{
  res.render('login');
})

router.post('/login', (req, res, next) =>{
  
  const { email, password } = req.body;
  let error;

  if(!email || !password) {
    error = 'Please make sure to enter e-mail and password';
    return res.render('login', { error });
  }
  
  User.findOne({ email })
  .then( user => {
    if(!user) {
      error = 'Invalid e-mail';
      return res.render('login', { error });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password)

    if(isValidPassword) {
      req.session.currentUser = user;
      res.redirect('/');
    }
    else {
      error = 'Wrong password'
      return res.render('login', { error });
    }
  })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy( () => {
    res.redirect('/login');
  });
})

module.exports = router;
