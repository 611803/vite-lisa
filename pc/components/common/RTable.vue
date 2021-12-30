<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useLisaStore from 'lisa/pc/store/lisa'
import { updateRouteQuery } from 'lisa/pc/utils/func'
const props = defineProps({
  total: Number,
  noPage: {
    type: Boolean,
    default: false,
  },
})

const lisaStore = useLisaStore()
const route = useRoute()
const router = useRouter()

const pageData = reactive({
  showPage: true,
  size: 10,
  current: 1,
  realTotal: 0,
})
watch(() => props.total, val => {
  pageData.realTotal = val
})
watch(() => route.query, val => {
  const { limit, offset } = val
  const thisCurrent = (offset / limit) + 1
  if (thisCurrent !== pageData.current) {
    pageData.current = thisCurrent
  }
})

onMounted(() => {
  if (!props.noPage) {
    pageData.showPage = false
    nextTick(() => {
      // 这时候store中肯定有值
      const pageOption = lisaStore.pageOption[route.name]

      pageData.size = Number(pageOption.limit)
      pageData.current = Number(pageOption.current)
      pageData.realTotal = Number(pageOption.total)
      pageData.showPage = true
    })
  }
})

const handleSizeChange = (val) => {
  pageData.size = val
  pageData.current = 1
  handleCurrentChange()
}
const handleCurrentChange = () => {
  const offset = (pageData.current - 1) * pageData.size
  updateRouteQuery(route, router, {
    offset: offset,
    limit: pageData.size,
    current: pageData.current,
    total: pageData.realTotal,
  })
}

const isMore = ref(false)
const changeIsMore = () => {
  isMore.value = !isMore.value
}

</script>

<template>
  <div class="r-table">
    <div class="table-header-wrap">
      <div class="table-header" :class="{'show-more': isMore}">
        <div class="table-header-base">
          <div class="table-header-base-left">
            <slot name="handleUpLeftButtons"></slot>
          </div>
          <div class="table-header-base-right">
            <el-form :inline="true">
              <slot name="handleUpRightButtons"></slot>
              <el-button type="text" @click="changeIsMore">
                高级搜索<el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </el-button>
            </el-form>
          </div>
        </div>
        <div class="table-header-more">
          <el-form :inline="true">
            <slot name="handleUpMore"></slot>
          </el-form>
          <el-button type="text" @click="changeIsMore">
            收起<el-icon class="el-icon--right"><CaretTop /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    <div class="table-content">
      <slot name="table"></slot>
    </div>
    <div class="table-footer" v-if="!noPage">
      <div class="table-footer-left">
        <slot name="handleBottomLeftButtons"></slot>
      </div>
      <div class="table-footer-right">
        <el-pagination background
          v-show="pageData.showPage"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          :total="pageData.realTotal"
          v-model:page-size="pageData.size"
          v-model:current-page="pageData.current"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.r-table {
  .table-header-wrap {
    width: 100%;
    height: 50px;
    overflow: hidden;

    .table-header {
      height: 100px;
      margin-bottom: 10px;
      overflow: hidden;
      transition: transform .5s;

      &.show-more {
        transform: translateY(-50%);
      }

      &-base {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 50px;

        &-left {
          .el-button {
          }
        }

        &-right {

        }
      }

      &-more {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 50px;
      }

      .el-form-item {
        margin-bottom: 0;

        // .el-form-item__content > .el-button {
        //   vertical-align: top;
        // }
      }
    }
  }

  .table-content {
    .el-table--medium .el-table__cell {
      padding: 5px 0;
    }
  }

  .table-footer {
    display: flex;
    justify-content: space-between;

    // height: 32px;
    margin-top: 10px;

    &-left{
    }

    &-right{
    }
  }
}

</style>
