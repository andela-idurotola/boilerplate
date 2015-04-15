
module.exports = function(app,  data) {
  app.get('/*',function(req, res) {
    console.log('-----------+++++++---------+++++++++--------');
    res.sendFile("index.html",{root:'./public'});
  });
};
