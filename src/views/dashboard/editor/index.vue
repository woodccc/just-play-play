<template>
  <div class="dashboard-editor-container">
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-col :span="8" v-if="lineChartData[0].seriesOriginData" v-for="(chart, index) in lineChartData" :key="index">
        <h2>{{get(chart, 'title', '')}}</h2>
        <line-chart :chart-data="chart" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LineChart from '../admin/components/LineChart'
import dayjs from 'dayjs'

import { get, toPairs } from 'lodash'

import { fetchChartDataByNameAndDate, fetchDatesByDbName, fetchNames } from '@/api/db'

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default {
  name: 'DashboardEditor',
  components: { LineChart },
  data() {
    const needShowDBIndexes = [1, 3, 4, 5, 6, 7]

    return {
      chart: null,
      timer: null,
      needShowDBIndexes,
      dbNames: [],
      emptyGif: 'https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3',
      lineChartData: needShowDBIndexes.map(() => {
        return {
          xAxisData: [],
          seriesOriginData: [],
        }
      })
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  async mounted() {
    const dbNameResponse = await fetchNames()
    const dbNames = dbNameResponse.data
    this.dbNames = dbNames
    this.handleRefreshAllChart()
    this.timer = setInterval(() => {
      this.handleRefreshAllChart()
    }, 30000)
  },
  methods: {
    get,
    handleRefreshAllChart() {
      this.needShowDBIndexes.forEach((dBIndex, index) => {
        this.handleLoadChartData(index, dBIndex)
      })
    },
    async handleLoadChartData(chartIndex, dbIndex) {
      this.lineChartData[chartIndex].title = this.dbNames[dbIndex]
      const dbResponse = await fetchDatesByDbName(this.dbNames[dbIndex])
      const dbDates = dbResponse.data
      const chartResponse = await fetchChartDataByNameAndDate(this.dbNames[dbIndex], dbDates[dbDates.length - 1])
      const chartResponseData = chartResponse.data

      this.lineChartData[chartIndex].xAxisData = []

      chartResponseData.forEach((item) => {
        const a = dayjs((item.result[0].value['0']) * 1000).format("MM-DD HH:mm")
        this.lineChartData[chartIndex].xAxisData.push(a)
      })

      let seriesOriginData = chartResponseData[0].result.map(item => {
        return {
          name: get(toPairs(item.metric), '0.1')
        }
      })
      seriesOriginData = seriesOriginData.map(seriesItem => {
        return {
          ...seriesItem,
          color: getRandomColor(),
          data: chartResponseData.map(originItem => {
            const target = originItem.result.find(item => get(toPairs(item.metric), '0.1') === seriesItem.name)
            return Number(get(target, 'value.1', '0'))
          })
        }
      })
      this.lineChartData[chartIndex].seriesOriginData = seriesOriginData
    }
  }
}
</script>

<style lang="scss" scoped>
  .emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
  }

  .dashboard-editor-container {
    /*background-color: #e3e3e3;*/
    min-height: 100vh;
    /*padding: 50px 60px 0px;*/
    .pan-info-roles {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      display: block;
    }
    .info-container {
      position: relative;
      margin-left: 190px;
      height: 150px;
      line-height: 200px;
      .display_name {
        font-size: 48px;
        line-height: 48px;
        color: #212121;
        position: absolute;
        top: 25px;
      }
    }
  }
</style>
