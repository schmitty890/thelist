(function($){
  // Getting a reference to the input field where user adds a new todo
  var $newItemInput = $("input.new-item");
  var $newNameInput = $("input.name");
  // Our new todos will go inside the todoContainer
  var $todoContainer = $(".todo-container");
  // Adding event listeners for deleting, editing, and adding todos
  $(document).on("click", "button.delete", function(event) {
    deleteTodo($(this), event);
  });
  $(document).on("click", "button.complete", function(event) {
    toggleComplete($(this), event);
  });
  $(document).on("click", ".todo-item", function() {
    editTodo($(this));
  });
  $(document).on("keyup", ".todo-item", function() {
    finishEdit($(this));
  });
  $(document).on("blur", ".todo-item", function() {
    cancelEdit($(this));
  });
  $(document).on("submit", "#todo-form", function(event) {
    insertTodo(event);
  });

  // Our initial todos array
  var todos = [];

  // Getting todos from database when page loads
  getTodos();

  /**
   * [initializeRows resets the todos displayed with new todos from the database]
   */
  // function initializeRows() {
  //   $todoContainer.empty();
  //   var rowsToAdd = [];
  //   for (var i = 0; i < todos.length; i++) {
  //     rowsToAdd.push(createNewRow(todos[i]));
  //   }
  //   $todoContainer.prepend(rowsToAdd);
  // }

  /**
   * [getTodos grabs todos from the database and updates the view]
   */
  function getTodos() {
    $.ajax({
      method: "GET",
      url: "/api/todos"
    }).then(function(data) {
      todos = data;
      // initializeRows();
      // location.reload();
    });
  }

  /**
   * [deleteTodo deletes a todo when the user clicks the delete button]
   */
  function deleteTodo(element, event) {
    event.stopPropagation();
    var id = element.attr("id");
    $.ajax({
      method: "DELETE",
      url: "/api/todos/" + id
    }).then(function() {
      getTodos();
    });
  }

  /**
   * [editTodo handles showing the input box for a user to edit a todo]
   */
  function editTodo(element) {
    var currentTodo = element.data("todo");
    element.children().hide();
    element.children("input.edit").val(currentTodo.text);
    element.children("input.edit").show();
    element.children("input.edit").focus();
  }

  /**
   * [toggleComplete Toggles complete status]
   */
  function toggleComplete(element, event) {
    event.stopPropagation();
    var todo = {
      complete: element.parent().attr("data-complete"),
      id: element.parent().attr("data-id")
    }
    
    if(todo.complete === 'true') {
      todo.complete = true;
    } else if(todo.complete === 'false') {
      todo.complete = false;
    }
    console.log(todo.complete);
    todo.complete = !todo.complete;
    updateTodo(todo);
  }

  /**
   * [finishEdit starts updating a todo in the database if a user hits the "Enter Key"
   *  While in edit mode]
   */
  function finishEdit(element) {
    var updatedTodo = element.data("todo");
    if (event.which === 13) {
      updatedTodo.text = element.children("input").val().trim();
      element.blur();
      updateTodo(updatedTodo);
    }
  }

  /**
   * [updateTodo updates a todo in our database]
   */
  function updateTodo(todo) {
    // console.log(todo);
    $.ajax({
      method: "PUT",
      url: "/api/todos",
      data: todo
    }).then(function() {
      getTodos();
    });
  }

  /**
   * [cancelEdit called whenever a todo item is in edit mode and loses focus
   *  This cancels any edits being made]
   */
  function cancelEdit(element) {
    var currentTodo = element.data("todo");
    if (currentTodo) {
      element.children().hide();
      element.children("input.edit").val(currentTodo.text);
      element.children("span").show();
      element.children("button").show();
    }
  }

  /**
   * [createNewRow constructs a todo-item row]
   */
  function createNewRow(todo) {
    var $newInputRow = $(
      [
        `<li class='list-group-item todo-item'>
          <span>${todo.text}</span><span> | created by: ${todo.name}</span>
          <span> | last updated: ${moment(todo.updatedAt).fromNow()}</span>
          <input type='text' class='edit' style='display: none;'>
          <button id='${todo.id}' class='delete btn btn-danger'>x</button>
          <button class='complete btn btn-primary'>✓</button>
        </li>`
      ].join("")
    );

    // $newInputRow.find("button.delete").data("id", todo.id);
    $newInputRow.data("todo", todo);
    if (todo.complete) {
      $newInputRow.find("span").css("text-decoration", "line-through");
    }
    return $newInputRow;
  }

  /**
   * [insertTodo inserts a new todo in the database and then updates the view]
   * @param  {[type]} event [description]
   */
  function insertTodo(event) {
    event.preventDefault();
    var todo = {
      text: $newItemInput.val().trim(),
      complete: false,
      name: $newNameInput.val().trim()
    };

    $.ajax({
      type: "POST",
      url: "/api/todos",
      data: todo
    }).then(function(err) {
      if(err.errors) {
        errorHandling(err);
      } else {
        getTodos();
      }
    });

    location.reload();
    // reset values and focus first input
    $newItemInput.val("");
    $newNameInput.val("").focus();
  }

  /**
   * [errorHandling handle errors in a switch case. future validation will add more cases the more validation that is put in]
   */
  function errorHandling(err) {
    var errorMessage = err.errors["0"].message;

    switch(errorMessage) {
      case 'Validation len on text failed':
        //display modal or div on the page showing error, for now we alert
        alert(`Enter in an item from 1 to 140 characters in length.`);
        break;
      default:
        console.log(`error not tracked yet: ${errorMessage}`);
    }
  }
})(jQuery);


