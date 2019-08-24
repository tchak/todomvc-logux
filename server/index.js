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
  if (todo) {
    const { id, text, completed } = todo;
    ctx.sendBack({ type: 'ADD_TODO', id, text, completed });
  } else {
    ctx.sendBack({ type: 'DELETE_TODO', id });
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

server.channel('todo/:id', {
  access(ctx, action, meta) {
    return true;
  },
  async init(ctx, action, meta) {
    const todo = await todos.find(ctx.params.id);
    sendBackTodo(ctx, todo);
  }
});

let lastAdd;
server.type('ADD_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channels: ['todos', `todo/${action.id}`] };
  },
  async process(ctx, action, meta) {
    await todos.add(action.id, action.text);
  }
});

server.type('EDIT_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channels: ['todos', `todo/${action.id}`] };
  },
  async process(ctx, action, meta) {
    await todos.update(action.id, action.text);
  }
});

server.type('DELETE_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channels: ['todos', `todo/${action.id}`] };
  },
  async process(ctx, action, meta) {
    await todos.remove(action.id);
  }
});

server.type('COMPLETE_TODO', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channels: ['todos', `todo/${action.id}`] };
  },
  async process(ctx, action, meta) {
    await todos.toggle(action.id);
  }
});

server.type('CLEAR_COMPLETED', {
  access(ctx, action, meta) {
    return true;
  },
  resend(ctx, action, meta) {
    return { channels: ['todos', `todo/${action.id}`] };
  },
  async process(ctx, action, meta) {
    await todos.clear();
  }
});

server.listen();
