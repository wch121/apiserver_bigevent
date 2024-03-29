// 1. 导入定义验证规则的模块
const joi = require('joi')

// 分别定义 标题、分类Id、内容、发布状态的校验规则
const title = joi.string().required()
const cate_id = joi.number().integer().min(1).required()
const content = joi.string().required().allow('')
const state = joi.string().valid('已发布', '草稿').required()

// id 的校验规则
const id = joi.number().integer().min(1).required()

// 验证规则对象 - 发布文章
exports.add_article_schema = {
  body: {
    title,
    cate_id,
    content,
    state,
  },
}

// 验证规则对象 - 删除文章
exports.delete_article_schema = {
  params: {
    id,
  },
}

// 验证规则对象 - 根据Id获取文章
exports.get_article_schema = {
  params: {
    id,
  },
}
// 验证规则对象 - 根据Id更新文章
exports.eidt_article_schema = {
  body: {
      id,
      title,
      cate_id,
      content,
      state
  }
}