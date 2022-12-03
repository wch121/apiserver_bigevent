// 文章的处理函数模块
const path = require('path')
const db = require('../db/index')

// 发布文章的处理函数
exports.addArticle = (req, res) => {
  console.log(req.file)
  if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！')

  // TODO：证明数据都是合法的，可以进行后续业务逻辑的处理
  // 处理文章的信息对象
  const articleInfo = {
    // 标题、内容、发布状态、所属分类的Id
    ...req.body,
    // 文章封面的存放路径
    cover_img: path.join('/uploads', req.file.filename),
    // 文章的发布时间
    pub_date: new Date(),
    // 文章作者的Id
    author_id: req.user.id,
  }

  const sql = `insert into ev_articles set ?`
  db.query(sql, articleInfo, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('发布新文章失败！')
    res.cc('发布文章成功！', 0)
  })
}

// 获取文章的列表数据的处理函数
exports.getArticle = (req, res) => {
  // 定义查询用户信息的 SQL 语句
  const sql = `select ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.cate_id=ev_article_cate.Id`
  // 调用 db.query() 执行 SQL 语句
  db.query(sql, (err, results) => {
      // 用户信息获取成功
      res.send({
          status: 0,
          message: '获取用户信息成功！',
          data: results,
      })
  })
}