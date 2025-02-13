<template>
  <div class="setup">
    <main>
      <header v-if="!form">
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          {{
            $t('projects.create.format.setup.title', {
              name: template.name,
            })
          }}
        </div>

        <div class="unnnic-font secondary body-lg color-neutral-cloudy">
          {{ template.description }}
        </div>
      </header>

      <form @submit.prevent="submit">
        <template v-for="field in template.setup.fields">
          <unnnic-select
            v-if="field.type === 'select' && options[field.ref]"
            :key="field.name"
            v-model="localValues[field.name]"
            :label="field.label || field.name"
            search
          >
            <option
              v-for="(option, index) in options[field.ref]"
              :key="index"
              :value="option[field.item_value]"
            >
              {{ option[field.item_label] }}
            </option>
          </unnnic-select>
          <unnnic-input-next
            v-if="!['textarea', 'select', 'fixed'].includes(field.type)"
            :key="field.name"
            size="md"
            v-model="localValues[field.name]"
            :label="field.label || field.name"
            :native-type="field.type"
            :allow-toggle-password="field.type === 'password'"
            :error="error(localValues[field.name], field.rules)"
          />
          <div :key="field.name" v-if="field.type === 'textarea'">
            <div class="field__label">
              <unnnic-label :label="field.label" />
              <unnnic-tool-tip
                v-if="field.info"
                :text="field.info"
                enabled
                side="right"
                maxWidth="15rem"
              >
                <unnnic-icon-svg
                  icon="information-circle-4"
                  size="sm"
                  scheme="neutral-clean"
                />
              </unnnic-tool-tip>
            </div>
            <unnnic-text-area size="md" v-model="localValues[field.name]" />
          </div>
        </template>

        <unnnic-button v-if="!form" :disabled="disabled" type="secondary">
          {{ $t('projects.create.format.setup.complete') }}
        </unnnic-button>

        <unnnic-button
          v-else
          :disabled="disabled"
          class="template-settings__button"
        >
          {{ $t('orgs.create.done') }}
        </unnnic-button>
      </form>
    </main>

    <div v-if="!form" class="image">
      <img :src="template.setup.image.src" />

      <div class="unnnic-font secondary body-sm color-neutral-cloudy">
        {{ template.setup.image.description }}
      </div>
    </div>
  </div>
</template>

<script>
import projects from '../../../api/projects';

export default {
  props: {
    /*
     * [
     *   { label: 'APP_KEY', name: 'APP_KEY', type: 'text' },
     *   { label: 'APP_SECRET', name: 'APP_SECRET', type: 'password' },
     * ]
     */
    template: {
      type: Object,
      default() {
        return {};
      },
    },

    form: Boolean,
  },

  data() {
    return {
      localValues: {},
      customTemplate: false,
      options: {},
    };
  },

  computed: {
    disabled() {
      return this.template.setup.fields.some(
        ({ name, rules }) =>
          !this.localValues[name] || this.error(this.localValues[name], rules),
      );
    },
  },

  methods: {
    changeValue(name, value) {
      this.localValues[name] = value;
    },

    error(value, rules) {
      if (!rules) {
        return false;
      }

      if (!value.length) {
        return false;
      }

      if (rules.minLength) {
        if (value.length < rules.minLength) {
          return this.$t('errors.min_characters', {
            characters: rules.minLength,
          });
        }
      }

      if (rules.contains) {
        if (
          rules.contains === 'letters,numbers' &&
          !/^[A-z0-9]+$/.test(value)
        ) {
          return this.$t('errors.letters,numbers');
        } else if (rules.contains === 'numbers' && !/^[0-9]+$/.test(value)) {
          return this.$t('errors.numbers');
        }
      }
    },

    submit() {
      const values = {};

      this.template.setup.fields
        .map(({ name }) => name)
        .forEach((name) => {
          values[name] = this.localValues[name];
        });

      this.$emit('submit', values);
    },

    getInfos() {
      this.template.setup.fields
        .filter((field) => field.type === 'select')
        .forEach(async (item) => {
          const { data } = await projects.getOmieInfos(
            item.ref,
            this.localValues.appkey,
            this.localValues.appsecret,
          );
          this.$set(this.options, item.ref, data[item.ref]);
        });
    },
  },

  watch: {
    'template.setup.fields': {
      immediate: true,

      deep: true,

      handler() {
        this.template.setup.fields.forEach((field) => {
          if (!this.localValues[field.name]) {
            this.$set(this.localValues, field.name, '');
          }
          if (field.type === 'fixed') {
            this.$set(this.localValues, field.name, field.content);
          }
        });
      },
    },
    'template.name': {
      immediate: true,
      deep: true,

      handler(value) {
        if (value === 'omie_lead_capture') this.customTemplate = true;
      },
    },
    'localValues.appkey': {
      deep: true,
      immediate: true,

      handler(value) {
        if (
          value.length > 10 &&
          this.customTemplate &&
          this.localValues.appsecret.length > 30
        ) {
          this.getInfos();
        }
      },
    },
    'localValues.appsecret': {
      deep: true,
      immediate: true,

      handler(value) {
        if (
          value.length > 30 &&
          this.customTemplate &&
          this.localValues.appkey.length > 10
        ) {
          this.getInfos();
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.setup {
  display: flex;
  gap: $unnnic-spacing-inline-lg;

  main {
    flex: 1;

    header {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-md;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-stack-md;
    }

    form {
      .unnnic-input + .unnnic-input {
        margin-top: $unnnic-spacing-stack-sm;
      }

      .unnnic-label__label {
        margin-right: $unnnic-spacing-stack-nano;
      }

      .field__label {
        margin-top: $unnnic-spacing-stack-sm;
        display: flex;
        align-items: center;
      }

      .unnnic-button {
        width: 100%;
        margin-top: $unnnic-spacing-stack-sm;
      }
    }
  }

  .image {
    width: 27rem;
    padding: $unnnic-spacing-inset-xs;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;

    img {
      width: 100%;
      flex: 1;
      object-fit: contain;
    }
  }

  @media screen and (max-width: 1150px) {
    flex-direction: column;

    .image {
      width: initial;

      img {
        max-height: 15rem;
      }
    }
  }
}
</style>
