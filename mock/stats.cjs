// json-server 的 --middlewares 会用 require() 加载这个文件。
// 项目是 "type": "module"，所以这里用 .cjs 明确表示 CommonJS。
module.exports = (req, res, next) => {
  if (req.method !== 'GET' || req.path !== '/stats') {
    return next()
  }

  const todos = req.app.db.get('todos').value() ?? []
  const total = todos.length
  const completed = todos.filter((todo) => todo.completed).length

  res.json({ total, completed })
}
