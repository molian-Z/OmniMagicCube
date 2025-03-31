<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ElButton } from "element-plus";

defineProps({
  animations: {
    type: Array as any,
    default: () => [],
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["select", "add", "delete", "edit"]);

// 编辑动画
const editAnimation = (index: number, event: Event) => {
  selectAnimation(index);
  event.stopPropagation(); // 阻止冒泡，避免触发选择
  emit("edit", index);
};

const { t } = useI18n();

// 选择动画
const selectAnimation = (index: number) => {
  emit("select", index);
};

// 添加新动画
const addAnimation = () => {
  emit("add");
};

// 删除动画
const deleteAnimation = (index: number, event: Event) => {
  event.stopPropagation(); // 阻止冒泡，避免触发选择
  emit("delete", index);
};
</script>

<template>
  <div class="animation-list">
    <div class="list-header">
      <span>{{ t("animation.animationList") }}</span>
      <ElButton type="primary" size="small" @click="addAnimation">
        <i class="el-icon-plus"></i>
        {{ t("animation.add") }}
      </ElButton>
    </div>

    <div class="list-content">
      <div
        v-for="(animation, index) in animations"
        :key="index"
        :class="['animation-item', { active: index === currentIndex }]"
        @click="selectAnimation(index)"
      >
        <div class="animation-item-content">
          <div class="animation-item-name">
            {{ animation.name || `${t("animation.animation")} ${index + 1}` }}
          </div>
          <div class="animation-item-info">
            <span class="engine-badge">{{ animation.engine }}</span>
            <span class="effects-count"
              >{{ animation.effects?.length || 0 }}
              {{ t("animation.effect.effect") }}</span
            >
          </div>
        </div>
        <div class="animation-item-actions">
          <div class="actions">
            <ElButton type="primary" size="small" @click="editAnimation(index, $event)">
              <svg-icon icon="ep:edit" />
            </ElButton>
            <ElButton
              type="danger"
              size="small"
              @click="(e) => deleteAnimation(index, e)"
            >
              <svg-icon icon="ep:delete" />
            </ElButton>
          </div>
        </div>
      </div>

      <div v-if="animations.length === 0" class="empty-list">
        {{ t("animation.noAnimations") }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.animation-list {
  margin-bottom: 16px;
  border: 1px solid var(--ml-border-color-light);
  border-radius: var(--ml-radius-base);

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--ml-fill-color-light);
    border-bottom: 1px solid var(--ml-border-color-light);

    span {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .list-content {
    max-height: 200px;
    overflow-y: auto;

    .animation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--ml-fill-color-light);
      }

      &.active {
        background-color: var(--ml-primary-color-light);
      }

      .animation-item-content {
        flex: 1;
        overflow: hidden;

        .animation-item-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-bottom:1px;
        }

        .animation-item-info {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
          color: var(--ml-text-color-secondary);

          .engine-badge {
            background-color: var(--ml-fill-color-3);
            padding: 2px 6px;
            border-radius: 4px;
          }

          .effects-count {
            color: var(--ml-text-color-secondary);
          }
        }
      }

      .animation-item-actions {
        display: flex;
        align-items: center;
        gap: 4px;

        .edit-btn,
        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--ml-text-color-secondary);
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            background-color: var(--ml-fill-color-3);
          }
        }

        .edit-btn:hover {
          color: var(--ml-primary-color);
        }

        .delete-btn:hover {
          color: var(--ml-danger-color);
        }
      }
    }

    .empty-list {
      padding: 16px;
      text-align: center;
      color: var(--ml-text-color-secondary);
    }
  }
}
</style>
