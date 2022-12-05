// 文章的路由模块
const express = require('express')
const router = express.Router()

// 导入需要的处理函数模块
const article_handler = require('../router_handler/article')

// 导入 multer 和 path
const multer = require('multer')
const path = require('path')

// 创建 multer 的实例
const uploads = multer({ dest: path.join(__dirname, '../uploads') })
// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const { add_article_schema, delete_article_schema, get_article_schema, eidt_article_schema } = require('../schema/article')

// 发布文章的路由
router.post('/add', uploads.single('cover_img'), expressJoi(add_article_schema), article_handler.addArticle)
// 获取文章的列表数据的路由
router.get('/list', article_handler.getArticle)
// 根据 Id 删除文章的路由
router.get('/delete/:id', expressJoi(delete_article_schema), article_handler.deleteArticlebyId)
// 根据 Id 获取文章的路由
router.get('/article/:id', expressJoi(get_article_schema), article_handler.getArticleById)
// 根据 Id 更新文章的路由
router.post('/edit', uploads.single('cover_img'), expressJoi(eidt_article_schema), article_handler.editArticleById)

module.exports = router
