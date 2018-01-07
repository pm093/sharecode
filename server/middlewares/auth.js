const auth = (req,res,next) => {
  if (!req.user) {
    console.log('wlaczony middleware');
    res.redirect('/auth/google');
  }else{
    next();
  }
}

export default auth;