// 指定维度音乐排行榜歌曲列表

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    chartCode: query.chartCode,
    targetId: query.targetId,
    targetType: query.targetType,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request('/api/chart/song/detail', data, createOption(query, 'weapi'))
}
