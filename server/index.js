const { Server } = require('@logux/server');
const Datastore = require('nedb');

const Todos = require('./todos');

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    root: __dirname
  })
);

const db = new Datastore({ filename: 'db/test.db', autoload: true });
const todos = new Todos(db);

function sendBackTodo(ctx, todo) {
  const { id } = todo;
  if (todo.meta.deleted) {
    ctx.sendBack({ type: 'DELETE_TODO', id });
  } else {
    const { text, completed } = todo;
    ctx.sendBack({ type: 'ADD_TODO', id, text, completed });
  }
}

server.auth((userId, token) => {
  // Allow only local users until we will have a proper authentication
  return process.env.NODE_ENV === 'development'
});

server.channel('todos', {
  access(ctx, action, meta) {
    return true;
  },
  async init (ctx, action, meta) {
    for (let todo of await todos.all()) {
      sendBackTodo(ctx, todo);
    }
  }
});

server.type('ADD_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channel: 'todos' };
  },
  async process(ctx, action, meta) {
    await todos.addTodo(action.id, action.text, meta);
  }
});

server.type('EDIT_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channel: 'todos' };
  },
  async process(ctx, action, meta) {
    await todos.editTodo(action.id, action.text, meta);
  }
});

server.type('DELETE_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channel: 'todos' };
  },
  async process(ctx, action, meta) {
    await todos.removeTodo(action.id, meta);
  }
});

server.type('COMPLETE_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channel: 'todos' };
  },
  async process(ctx, action, meta) {
    await todos.toggleTodo(action.id, meta);
  }
});

server.type('CLEAR_COMPLETED', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channel: 'todos' };
  },
  async process(ctx, action, meta) {
    await todos.clearCompleted(meta);
  }
});

server.listen();
