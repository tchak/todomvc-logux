class Todos {
  constructor(db) {
    this.db = db;
  }

  async add(id, text) {
    const todo = await this.find(id);
    if (todo) {
      return todo;
    }
    return new Promise((resolve, reject) => {
      this.db.insert([ { _id: id, text }], (err) => {
        if (!err) {
          resolve({ id, text });
        } else {
          reject(err);
        }
      });
    });
  }

  update(id, text) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: id }, { $set: { text } }, (err) => {
        if (!err) {
          resolve({ id, text });
        } else {
          reject(err);
        }
      });
    });
  }

  async toggle(id) {
    const todo = await this.find(id);
    const completed = !todo.completed;

    return new Promise((resolve, reject) => {
      this.db.update({ _id: id }, { $set: { completed } }, (err) => {
        if (!err) {
          resolve({ id, completed });
        } else {
          reject(err);
        }
      });
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.db.remove({ completed: true }, { multi: true }, (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: id }, {}, (err) => {
        if (!err) {
          resolve();
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
          if (doc) {
            resolve(normalize(doc));
          } else {
            resolve(null);
          }
        } else {
          reject(err);
        }
      });
    });
  }
}

function normalize({ _id: id, text, completed }) {
  return {
    id,
    text,
    completed
  };
}

module.exports = Todos;
