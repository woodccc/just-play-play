import request from '@/utils/request'

export function fetchNames(query) {
  return request({
    url: '/v1/db/name',
    method: 'get',
    params: query
  })
}

export function fetchDatesByDbName(dbName) {
  return request({
    url: `/v1/db/${dbName}/collection`,
    method: 'get'
  })
}

export function fetchChartDataByNameAndDate(dbName, date) {
  return request({
    url: `/v1/db/${dbName}/${date}/map`,
    method: 'get'
  })
}
