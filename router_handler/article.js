// 文章的处理函数模块
const path = require('path')
const db = require('../db/index')
// 导入 mysql 模块
const mysql = require('mysql')
const { promisify } = require('util')

// 创建连接池
const dbpool = mysql.createPool({
  host: '127.0.0.1',  // 连接的服务器(代码托管到线上后，需改为内网IP，而非外网)
  port: 3306, // mysql服务运行的端口
  database: 'my_db_01', // 选择某个数据库
  user: "root",   // 用户名
  password: "123456", // 用户密码
})

const queryByPromisify = promisify(dbpool.query).bind(db)

// 对数据库进行增删改查操作的基础
const query1 = (sql, callback) => {
  dbpool.getConnection(function (err, connection) {
    connection.query(sql, function (err, rows) {
      callback(err, rows)
      connection.release()
    })
  })
}

//对数据库函数处理
const queryFn = (sql) => {
  return new Promise((resolve, reject) => {
    query1(sql, (err, data) => {
      if (err) reject(err);
      resolve(data);  // 返回拿到的数据
    })
  })
}


// 发布文章的处理函数
exports.addArticle = (req, res) => {
  // console.log(req.file)
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
    if (results.affectedRows !== 1) {
      res.send({
        status: 0,
        msg: '发布新文章失败！'
      })
      return res.cc('发布新文章失败！')
    } else {
      res.cc('发布文章成功！', 0)
      res.send({
        status: 0,
        msg: '更新文章成功'
      })
    }
  })
}

// 获取文章的列表数据的处理函数
exports.getArticle = async (req, res) => {
  // 获取前端传过来的当前页码(current)和每页显示个数(counts)
  let { pagenum, pagesize, cate_id, state } = req.query;
  //确认前端传来两个参数
  if (!pagenum || !pagesize) {
    res.send({
      status: 1,
      message: '参数有误',
    })
  } if (cate_id || state) {
    if (cate_id && state) {
      //得到数据库中到底有多少条文章(total)
      let sql = `SELECT COUNT(*) ROWS FROM ev_articles where is_delete=0 and ev_articles.cate_id='${cate_id}' and ev_articles.state='${state}'`;
      let result = await queryFn(sql)
      let total = result[0].ROWS;

      //去数据库查询对应的10条数据给前端
      /* 
      前端传回页码  1,2,3,4,5
      第1页数据 : index=0 (pagenum-1)*10=0 ->0-9
      第2页数据 : index=10 (pagenum-1)*10=10 ->10-19
      第3页数据 : index=20 (pagenum-1)*10=20 ->20-29
      */
      let sql1 = `SELECT ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id and ev_articles.cate_id='${cate_id}' and ev_articles.state='${state}' LIMIT ${(pagenum - 1) * pagesize},${pagesize}`;
      let results = await queryFn(sql1);
      res.send({
        status: 0,
        message: '获取用户信息成功！',
        pagenum,
        pagesize,
        total,
        data: results,
      })
    }
    if (cate_id) {
      //得到数据库中到底有多少条文章(total)
      let sql = `SELECT COUNT(*) ROWS FROM ev_articles where is_delete=0 and ev_articles.cate_id='${cate_id}'`;
      let result = await queryFn(sql)
      let total = result[0].ROWS;

      //去数据库查询对应的10条数据给前端
      /* 
      前端传回页码  1,2,3,4,5
      第1页数据 : index=0 (pagenum-1)*10=0 ->0-9
      第2页数据 : index=10 (pagenum-1)*10=10 ->10-19
      第3页数据 : index=20 (pagenum-1)*10=20 ->20-29
      */
      let sql1 = `SELECT ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id and ev_articles.cate_id='${cate_id}' LIMIT ${(pagenum - 1) * pagesize},${pagesize}`;
      let results = await queryFn(sql1);
      res.send({
        status: 0,
        message: '获取用户信息成功！',
        pagenum,
        pagesize,
        total,
        data: results,
      })
    }
    if (state) {
      //得到数据库中到底有多少条文章(total)
      let sql = `SELECT COUNT(*) ROWS FROM ev_articles where is_delete=0 and ev_articles.state='${state}'`;
      let result = await queryFn(sql)
      let total = result[0].ROWS;

      //去数据库查询对应的10条数据给前端
      /* 
      前端传回页码  1,2,3,4,5
      第1页数据 : index=0 (pagenum-1)*10=0 ->0-9
      第2页数据 : index=10 (pagenum-1)*10=10 ->10-19
      第3页数据 : index=20 (pagenum-1)*10=20 ->20-29
      */
      let sql1 = `SELECT ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id and ev_articles.state='${state}' LIMIT ${(pagenum - 1) * pagesize},${pagesize}`;
      let results = await queryFn(sql1);
      res.send({
        status: 0,
        message: '获取用户信息成功！',
        pagenum,
        pagesize,
        total,
        data: results,
      })
    }
  }
  //得到数据库中到底有多少条文章(total)
  let sql = `SELECT COUNT(*) ROWS FROM ev_articles where is_delete=0`;
  let result = await queryFn(sql)
  let total = result[0].ROWS;

  //去数据库查询对应的10条数据给前端
  /* 
  前端传回页码  1,2,3,4,5
  第1页数据 : index=0 (pagenum-1)*10=0 ->0-9
  第2页数据 : index=10 (pagenum-1)*10=10 ->10-19
  第3页数据 : index=20 (pagenum-1)*10=20 ->20-29
  */
  let sql1 = `SELECT ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id LIMIT ${(pagenum - 1) * pagesize},${pagesize}`;
  let results = await queryFn(sql1);
  res.send({
    status: 0,
    message: '获取文章信息成功！',
    pagenum,
    pagesize,
    total,
    data: results,
  })
  // // 定义查询文章信息的 SQL 语句
  // const sql = `select ev_articles.id as id,title,pub_date,state,ev_article_cate.name as cate_name from ev_articles,ev_article_cate where ev_articles.is_delete=0 and ev_articles.cate_id=ev_article_cate.Id`
  // // 调用 db.query() 执行 SQL 语句
  // db.query(sql, (err, results) => {
  //     // 用户信息获取成功
  //     res.send({
  //         status: 0,
  //         message: '获取用户信息成功！',
  //         data: results,
  //     })
  // })
}


// 删除文章的处理函数
exports.deleteArticlebyId = (req, res) => {
  // 定义标记删除的 SQL 语句
  const sql = `update ev_articles set is_delete=1 where id=?`
  // 调用 db.query() 执行 SQL 语句
  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除文章失败！')
    res.cc('删除文章成功！', 0)
  })
}

// 根据 Id 获取文章的处理函数
exports.getArticleById = (req, res) => {
  // 定义根据 ID 获取文章分类数据的 SQL 语句
  const sql = `select * from ev_articles where id=?`
  // 调用 db.query() 执行 SQL 语句
  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('获取文章分类数据失败！')
    res.send({
      status: 0,
      message: '获取文章分类数据成功！',
      data: results[0],
    })
  })
}

// 根据 Id 更新文章的处理函数
exports.editArticleById = async (req, res) => {
  // 手动校验上传的文件
  if (!req.file || req.file.fieldname !== 'cover_img') {
    return res.cc('文章封面必选')
  }

  const sql = `update ev_articles set ? where id = ?`

  const articleinfo = {
    ...req.body,
    pub_date: new Date(),
    cover_img: path.join('/uploads', req.file.filename)
  }

  try {
    let result = await queryByPromisify(sql, [articleinfo, req.body.id])
    if (result.affectedRows !== 1) {
      res.cc('更新文章失败')
    }
    res.send({
      status: 0,
      msg: '更新文章成功'
    })
  } catch (e) {
    return res.cc(e)
  }
}