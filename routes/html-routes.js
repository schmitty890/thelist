var db = require("../models");

module.exports = function(app) {
  // GET route for getting all of the todos
  app.get("/", function(req, res) {
    //find all entries for a table when used with no options
    db.Todo.findAll({}).then(function(result) {
      //we have access to the todos as an argument inside of the cb
      // console.log(result);
      res.render("index", {
        Todos: result
      });
      // res.json(result);
    });
  });
};