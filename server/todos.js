const isFirstOlder = require('@logux/core/is-first-older');

class Todos {
  constructor(db) {
    this.db = db;
  }

  async addTodo(id, text, meta) {
    const todo = await this.find(id);
    if (todo) {
      return { id };
    }
    return new Promise((resolve, reject) => {
      this.db.insert([ { _id: id, text, meta }], (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }

  async editTodo(id, text, meta) {
    await this.update(id, { text }, meta);
  }

  async toggleTodo(id, meta) {
    const todo = await this.find(id);
    const completed = !todo.completed;
    return this.update(id, { completed }, meta);
  }

  async removeTodo(id, meta) {
    meta.deleted = Date.now();
    await this.update(id, {}, meta);
  }

  async clearCompleted(meta) {
    return new Promise((resolve, reject) => {
      meta.deleted = Date.now();
      this.db.update({ completed: true }, { $set: { meta } }, (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }

  all() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (!err) {
          resolve(docs.map(doc => normalize(doc)));
        } else {
          reject(err);
        }
      });
    });
  }

  find(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, (err, doc) => {
        if (!err) {
          if (!doc || doc.meta.deleted) {
            resolve(null);
          } else {
            resolve(normalize(doc));
          }
        } else {
          reject(err);
        }
      });
    });
  }

  async update(id, attributes, meta) {
    const todo = await this.find(id);
    if (isFirstOlder(todo && todo.meta, meta)) {
      return new Promise((resolve, reject) => {
        this.db.update({ _id: id }, { $set: { ...attributes, meta } }, (err) => {
          if (!err) {
            resolve(true);
          } else {
            reject(err);
          }
        });
      });
    }
  }
}

function normalize({ _id: id, text, completed, meta }) {
  return {
    id,
    text,
    completed,
    meta
  };
}

module.exports = Todos;
