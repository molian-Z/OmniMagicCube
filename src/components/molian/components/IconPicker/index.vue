<script setup lang="ts">
import {
  ref,
  defineModel,
  onMounted,
  computed,
  defineProps,
  inject,
  defineOptions,
} from "vue";
import { getIcon, Icon } from "@iconify/vue";
import Pagination from "@molianComps/Pagination/index.vue";
import { iconifyUrl } from "@molian/utils/defaultData";
defineOptions({
  name: "IconPicker",
});
defineProps({
  size: {
    type: Number,
    default: 24,
  },
});
const customComps: any = inject("customComps");
const { customDialog, customInput, customTag } = customComps;
const iconSets = ref<any[]>([]);
const iconList = ref<any[]>([]);
const currentIconSet = ref("");
const iconListTotal = ref<number>(0);
const modelValue = defineModel({ type: String });
const searchIconSetText = ref("");
const searchIconListText = ref("");
const currentPage = ref(1);
const currentPageSize = ref(49);

const visible = ref(false);
const filterIconSet = computed(() => {
  if (!!searchIconSetText.value) {
    return iconSets.value.filter((item) => {
      return item.name.toLowerCase().includes(searchIconSetText.value.toLowerCase());
    });
  } else {
    return iconSets.value;
  }
});

// const filterIconList = computed(() => {
//   if (!!searchIconListText.value) {
//     return iconList.value.map(mItem => {
//       return {
//         name: mItem.name, data: mItem.data.filter((item: string) => {
//           return item.toLowerCase().includes(searchIconListText.value.toLowerCase())
//         })
//       }
//     }).filter(item => item.data.length > 0)
//   } else {
//     return iconList.value
//   }
// })

const filterIconList = computed(() => {
  let icons: any[] = [];
  if (!!searchIconListText.value) {
    iconList.value.forEach((item) => {
      icons.push(
        ...item.data.filter((item: string) => {
          return item.toLowerCase().includes(searchIconListText.value.toLowerCase());
        })
      );
    });
  } else {
    iconList.value.forEach((item) => {
      icons.push(...item.data);
    });
  }
  return icons.slice(
    (currentPage.value - 1) * currentPageSize.value,
    (currentPage.value - 1) * currentPageSize.value + currentPageSize.value
  );
});

const getFilterIconTotal = computed(() => {
  let iconTotal = 0;
  if (!!searchIconListText.value) {
    iconList.value.forEach((item) => {
        iconTotal += item.data.filter((fitem: string) => {
        return fitem.toLowerCase().includes(searchIconListText.value.toLowerCase());
      }).length;
    });
    return iconTotal
  } else {
    return iconListTotal.value;
  }
});

const loadIcons = async (item: { total: number; prefix: string; name: string }) => {
  const res = await fetch(iconifyUrl + "collection?prefix=" + item.prefix, {
    method: "get",
  });
  // 将云端数据写入本地数据中
  iconList.value = [];
  const icons = await res.json();
  if (!!icons.uncategorized) {
    iconList.value = [
      {
        name: "未分类",
        data: icons.uncategorized,
      },
    ];
  } else if (!!icons.categories) {
    iconList.value = Object.keys(icons.categories).map((key) => {
      return {
        name: key,
        data: icons.categories[key],
      };
    });
  }
  currentIconSet.value = item.prefix;
  iconListTotal.value = item.total;
};

const onChange = (iconName: string) => {
  modelValue.value = currentIconSet.value + ":" + iconName;
};

const pageChange = (page: { currentPage: number; currentPageSize: number }) => {
  currentPage.value = page.currentPage;
  currentPageSize.value = page.currentPageSize;
};

onMounted(async () => {
  const res = await fetch(iconifyUrl + "collections", {
    method: "get",
  });
  // 将云端数据写入本地数据中
  const icons = await res.json();
  // 动态引入所有图标集
  Object.keys(icons).forEach((key: any) => {
    iconSets.value.push({ ...icons[key], prefix: key });
  });
});
</script>
<template>
  <div class="icon-picker" :style="{ width: size + 'px', height: size + 'px' }">
    <icon
      class="icon-picker__inner"
      :style="{ width: Number(size - 12) + 'px', height: Number(size - 12) + 'px' }"
      :icon="modelValue"
      v-if="getIcon(modelValue)"
      @click="visible = true"
    />
    <div class="icon-picker__inner" @click="visible = true" v-else>
      <icon
        class="icon-picker__inner__plus"
        :style="{ width: Number(size - 12) + 'px', height: Number(size - 12) + 'px' }"
        icon="ep:plus"
      ></icon>
    </div>
    <custom-dialog
      appendToBody
      header="选择图标"
      width="760px"
      :close-on-click-modal="false"
      @escKeydown="visible = false"
      @closeBtnClick="visible = false"
      v-model:visible="visible"
      destroyOnClose
      v-if="visible"
    >
      <div class="icon-picker-dialog">
        <div class="icon-picker-dialog__left">
          <div class="icon-picker-dialog__search">
            <customInput v-model="searchIconSetText" placeholder="查询图标集">
              <template #prefix>
                <icon icon="mdi:magnify" />
              </template>
            </customInput>
          </div>
          <div class="icon-sets">
            <div
              :class="['icon-sets__item', currentIconSet === item.prefix && 'active']"
              v-for="item in filterIconSet"
              :key="item.name"
              @click="loadIcons(item)"
            >
              <div class="icon-sets__item__title">{{ item.name }}</div>
              <!-- <div class="icon-sets__item__tags">
              <customTag style="margin:0 3px;" v-for="tagName in item.samples" :key="tagName">{{tagName}}</customTag>
            </div> -->
              <div class="icon-sets__item__desc">
                <div class="icon-sets__item__desc__category">{{ item.category }}</div>
                <div class="icon-sets__item__desc__total">{{ item.total }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="icon-picker-dialog__container">
          <div class="icon-picker-dialog__search">
            <customInput
              v-model="searchIconListText"
              placeholder="查询图标"
              :disabled="!currentIconSet"
            >
              <template #prefix>
                <icon icon="mdi:magnify" />
              </template>
            </customInput>
          </div>
          <div class="icon-picker-grid">
                <div class="icon-picker-grid__group__list">
              <div
                :class="[
                  'icon-picker-grid__item',
                  currentIconSet + ':' + iconName == modelValue && 'active',
                ]"
                v-for="iconName in filterIconList"
                :key="iconName"
                @click="onChange(iconName)"
              >
                <icon
                  class="icon-picker-grid__item__icon"
                  :icon="currentIconSet + ':' + iconName"
                ></icon>
              </div>
            </div>
          </div>
          <Pagination
            :total="getFilterIconTotal"
            :page-size="currentPageSize"
            :current="currentPage"
            @change="pageChange"
          >
          </Pagination>
        </div>
      </div>
    </custom-dialog>
  </div>
</template>

<style lang="scss" scoped>
.icon-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ml-border-color);
  border-radius: var(--ml-radius-base);
  transition: var(--ml-transition-base);

  &:hover {
    border-color: var(--ml-primary-color-hover);

    .icon-picker__inner {
      fill: var(--ml-primary-color-hover);
      color: var(--ml-primary-color-hover);
    }
  }

  .icon-picker__inner {
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: var(--ml-transition-base);
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-picker__inner__plus {
      color: var(--ml-border-color);
      transition: var(--ml-transition-base);

      &:hover {
        color: var(--ml-primary-color);
      }
    }
  }
}

.icon-picker-dialog {
  display: flex;

  .icon-picker-dialog__left {
    .icon-picker-dialog__search {
    }

    .icon-sets {
      width: 220px;
      margin: var(--ml-mg-base);
      height: 450px;
      overflow: auto;

      .icon-sets__item {
        padding: var(--ml-pd-base);
        cursor: pointer;
        user-select: none;
        transition: var(--ml-transition-base);

        .icon-sets__item__title {
          font-size: 14px;
          font-weight: bold;
          color: var(--ml-text-color-1);
        }

        .icon-sets__item__desc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--ml-text-color-6);
          margin: var(--ml-mg-small) 0;

          .icon-sets__item__desc__category {
            font-weight: bold;
          }

          .icon-sets__item__desc__total {
          }
        }

        &:hover {
          background-color: var(--ml-bg-page-color);
          border-radius: var(--ml-radius-small);
        }

        &.active {
          background-color: var(--ml-primary-color-light);
          border-radius: var(--ml-radius-small);
        }
      }
    }
  }

  .icon-picker-dialog__container {
    width: 100%;
    margin: 0 var(--ml-mg-base);
    overflow-x: hidden;

    .icon-picker-grid {
      height: 450px;
      margin: var(--ml-mg-base);
      overflow: auto;
      display: flex;
      .icon-picker-grid__group__title {
        padding: var(--ml-pd-base);
        font-weight: bold;
        color: var(--ml-text-color-1);
      }

      .icon-picker-grid__group__list {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;

        .icon-picker-grid__item {
          margin: var(--ml-mg-base);
          cursor: pointer;
          transition: var(--ml-transition-base);
          border-radius: var(--ml-radius-base);
          border: 1px solid var(--ml-border-color);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-picker-grid__item__icon {
            font-size: 27px;
          }

          &:hover {
            background-color: var(--ml-bg-page-color);
            border-color: var(--ml-primary-color-focus);
          }

          &.active {
            border-color: var(--ml-primary-color);
          }
        }
      }
    }
  }
}
</style>
