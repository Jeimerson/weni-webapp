<template>
  <div :class="{ 'billing-card': true, bordered: recommended, disabled }">
    <h1 class="billing-card__title">
      {{ title }}

      <unnnic-tag
        v-if="recommended"
        scheme="aux-baby-blue"
        :text="$t('billing.payment.plans.recommended')"
        type="default"
      />
    </h1>

    <div class="description">
      {{ description }}
    </div>

    <div
      class="pre-features"
      v-if="['advanced', 'enterprise'].includes(type) && showSameAsScaleText"
    >
      {{ $t('billing.payment.plans.features.scale_and') }}
    </div>

    <ul class="billing-list-beneficits">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="billing-list-beneficits__item"
      >
        <unnnic-icon-svg
          icon="check-2"
          size="sm"
          :scheme="disabled ? 'neutral-cloudy' : 'aux-blue'"
        />
        <span class="billing-list-beneficits__item__title">
          {{ option.title }}
        </span>
        <unnnic-tool-tip
          v-if="option.info"
          :text="option.info"
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
      </li>
    </ul>

    <div :class="['billing-price footer']">
      <template v-if="['trial', 'start', 'scale', 'advanced'].includes(type)">
        <div>
          <span class="billing-price__currency">R$&nbsp;</span>
          <span class="billing-price__price">
            {{ formatPrice(price) }}
          </span>
        </div>
      </template>

      <p class="billing-price__info">
        {{ attendencesFrom ? $t('billing.from') : $t('billing.up_to') }}

        <unnnic-tool-tip
          :text="$t('billing.attendences_info')"
          enabled
          side="bottom"
          maxWidth="280px"
        >
          {{ formatNumber(attendencesFrom || attendences) }}

          <template v-if="type === 'trial'">
            {{ $t('billing.attendences_for_1_month') }}
          </template>

          <template v-else-if="type === 'enterprise'">
            {{ $t('billing.attendences') }}
          </template>

          <template v-else>
            {{ $t('billing.attendences_by_month') }}
          </template>
        </unnnic-tool-tip>
      </p>
    </div>

    <div
      v-if="!hideSelect"
      :class="[
        'billing-buttons',
        {
          'top-spacing': ['start', 'scale', 'advanced'].includes(type),
          'bottom-spacing': ['advanced'].includes(type),
        },
      ]"
    >
      <div class="buttons">
        <div v-if="type === 'trial'" class="unnecessary-card">
          {{ $t(`billing.payment.plans.trial.unnecessary_card`) }}
        </div>

        <template v-if="type === 'enterprise'">
          <unnnic-button
            @click="redirectEmail"
            type="secondary"
            iconLeft="email-action-unread-1"
          >
            {{ $t(`billing.payment.plans.buttons.email`) }}
          </unnnic-button>
          <unnnic-button
            @click="redirectWhatsapp"
            type="secondary"
            iconLeft="messaging-whatsapp-1"
          >
            {{ $t(`billing.payment.plans.buttons.whatsapp`) }}
          </unnnic-button>
        </template>

        <unnnic-button
          v-else
          :loading="buttonLoading"
          :disabled="buttonDisabled || disabled"
          @click="$emit('select')"
          :type="recommended ? 'primary' : 'secondary'"
        >
          <template v-if="flow === 'change-plan' && organizationPlan === type">
            {{ $t('billing.current_plan') }}
          </template>

          <template v-else>
            {{
              $t(
                `billing.payment.plans.buttons.${
                  type === 'trial' ? 'free_to_play' : 'choose'
                }`,
              )
            }}
          </template>
        </unnnic-button>
      </div>
    </div>

    <div
      v-if="
        ['trial', 'start', 'scale'].includes(type) ||
        (['advanced', 'enterprise'].includes(type) && !showSameAsScaleText)
      "
      @click="$emit('update:expanded', !expanded)"
      class="show-more"
    >
      <unnnic-icon
        :icon="`arrow-button-${expanded ? 'up' : 'down'}-1`"
        scheme="neutral-cloudy"
        size="ant"
      />

      {{
        $t(`billing.payment.plans.features.view_${expanded ? 'less' : 'more'}`)
      }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import orgs from '../../api/orgs';

export default {
  props: {
    type: {
      type: String,
      validator: (val) =>
        ['trial', 'start', 'scale', 'advanced', 'enterprise'].includes(val),
    },

    flow: String,

    buttonLoading: {
      type: Boolean,
      default: false,
    },

    buttonDisabled: Boolean,

    pricingRanges: {
      type: Array,
    },

    extraWhatsappPrice: {
      type: Number,
    },

    hideSelect: Boolean,

    recommended: Boolean,

    disabled: Boolean,

    expanded: Boolean,

    showSameAsScaleText: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['currentOrg']),
    ...mapState({
      integrationsAmount: (state) => state.BillingSteps.integrations,
    }),

    plan() {
      const allPlans = this.$store.state.BillingSteps.pricing.plans;
      return allPlans[this.type];
    },

    price() {
      if (typeof this.plan?.price === 'number') {
        return this.plan.price * 100;
      }

      return 0;
    },

    attendencesFrom() {
      const allPlans = this.$store.state.BillingSteps.pricing.plans;

      if (this.plan?.limit === 'limitless') {
        const maxAttendences = Math.max(
          ...Object.keys(allPlans)
            .map((plan) => allPlans[plan].limit)
            .filter((value) => typeof value === 'number'),
        );

        return maxAttendences + 1;
      }

      return null;
    },

    attendences() {
      if (!this.plan) {
        return 100;
      }

      return this.plan.limit === 'limitless' ? null : this.plan.limit;
    },

    basePriceRange() {
      return this.pricingRanges?.find(({ from }) => from === 1);
    },

    getPaidPrice() {
      if (this.basePriceRange) {
        return (
          this.basePriceRange.to * this.basePriceRange.value_per_contact +
          this.extraWhatsappPrice *
            (this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations
              ? this.integrationsAmount
              : 0)
        );
      }

      return 0;
    },

    disableRemoveNewIntegrationButton() {
      return this.integrationsAmount == 1;
    },

    disableAddNewIntegrationButton() {
      return this.integrationsAmount == 10;
    },

    organizationPlan() {
      return this.currentOrg?.organization_billing?.plan;
    },

    defaultFeatures() {
      return [
        'unlimited_agents',
        'unlimited_campaigns',
        'unlimited_flows',
        'artificial_intelligence',
      ].concat(
        this.expanded
          ? ['channels', 'oficial_whatsapp', 'community', 'apis', 'academy']
          : [],
      );
    },

    options() {
      const plans = {
        trial: this.defaultFeatures,
        start: this.defaultFeatures,
        scale: this.defaultFeatures,
        advanced: ['email_support', 'one_manager', 'six_hours_with_an_expert'],
        enterprise: (this.showSameAsScaleText
          ? []
          : this.defaultFeatures
        ).concat([
          'all_time_support',
          'eight_hours_with_an_expert',
          'incident_alert',
          'security_monitoring',
        ]),
      };

      return plans[this.type].map((feature) => ({
        title: this.$t(`billing.payment.plans.features.${feature}.title`),
        info: this.$t(`billing.payment.plans.features.${feature}.info`),
      }));
    },

    title() {
      return this.$t(`billing.payment.plans.${this.type}.title`);
    },

    description() {
      return this.$t(`billing.payment.plans.${this.type}.description`);
    },
  },

  data() {
    return {
      isAddAcessCodeVisible: false,
      accessCode: '',
    };
  },

  mounted() {
    if (this.currentOrg?.extra_integration) {
      const extraIntegration = this.currentOrg?.extra_integration;

      if (extraIntegration > 0) {
        this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations = true;
        this.$store.state.BillingSteps.integrations = String(extraIntegration);
      }
    }

    if (this.$store.state.BillingSteps.pricing.status === null) {
      this.$store.state.BillingSteps.pricing.status = 'loading';

      orgs.plansPricing().then(({ data }) => {
        this.$store.state.BillingSteps.pricing.status = 'loaded';

        this.$store.state.BillingSteps.pricing.plans = data.plans;
      });
    }
  },

  methods: {
    ...mapActions(['addIntegration', 'removeIntegration']),
    redirectEmail() {
      location.href = 'mailto:comercial@weni.ai';
    },
    redirectWhatsapp() {
      window.open('https://wa.me/558230225978', '_blank').focus();
    },
    formatPrice(price) {
      if (price === 0) {
        return price;
      }

      let ponctuation = '.';

      if (this.$i18n.locale === 'pt-br') {
        ponctuation = ',';
      }

      return `${Math.floor(price / 100)}${ponctuation}${String(price).substr(
        -2,
      )}`;
    },

    formatNumber(number) {
      if (number < 1000) {
        return number;
      }

      const num = String(number);

      return [
        num.substr(0, num.length % 3),
        num.substr(num.length % 3).match(/\d{3}/g),
      ]
        .filter((num) => num)
        .join(this.$i18n.locale === 'pt-br' ? '.' : ',');
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-card {
  display: flex;
  flex-direction: column;
  color: black;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-inset-md;
  min-height: 500px;
  box-sizing: border-box;

  &.bordered {
    border: $unnnic-color-neutral-darkest solid $unnnic-border-width-thin;
  }

  &__title {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-black;
    margin-bottom: $unnnic-spacing-stack-sm;
    text-align: start;
    font-family: $unnnic-font-family-secondary;

    .unnnic-tag {
      display: inline-flex;
      width: max-content;
      margin-left: $unnnic-spacing-inline-sm;
      user-select: none;
    }
  }

  .description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  .pre-features {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
    margin-bottom: $unnnic-spacing-stack-xs;
  }

  .billing-list-beneficits {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: $unnnic-spacing-stack-md;

    &__item {
      display: flex;
      align-items: center;
      margin-bottom: $unnnic-spacing-stack-xs;

      &__title {
        margin: 0 $unnnic-inline-xs;
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
      }
    }
  }

  .billing-switch {
    display: flex;
    align-items: center;
    margin-top: $unnnic-spacing-stack-sm;
    > span {
      font-size: $unnnic-font-size-body-md;
    }
  }

  .billing-add-integration {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $unnnic-spacing-stack-xs;

    > button,
    .unnnic-form {
      width: 100%;
      max-width: 87px;
    }

    .unnnic-form {
      margin: 0 8px;
    }
  }

  &.disabled &__title {
    color: $unnnic-color-neutral-cloudy;
  }

  &.disabled {
    .billing-price__currency,
    .billing-price__price,
    .billing-price__info .unnnic-tooltip {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .billing-price {
    > div {
      margin-top: $unnnic-spacing-stack-md;
      display: flex;
      align-items: center;
    }

    &__currency {
      font-size: $unnnic-font-size-title-sm;
      color: $unnnic-color-neutral-black;
    }

    &__price {
      font-size: $unnnic-font-size-title-lg;
      color: $unnnic-color-brand-sec-dark;
      font-weight: $unnnic-font-weight-black;
    }

    &__info {
      margin: 0;
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

      .unnnic-tooltip {
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-dark;
        text-decoration: underline;
        cursor: pointer;
        text-underline-offset: $unnnic-spacing-stack-nano;
        text-decoration-thickness: $unnnic-border-width-thinner;
      }
    }
  }

  .footer {
    margin-top: auto;
  }

  .billing-buttons {
    text-align: center;
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;

    margin-top: $unnnic-spacing-stack-xs;

    &.top-spacing {
      margin-top: $unnnic-spacing-stack-xl;
    }

    &.bottom-spacing {
      margin-bottom: $unnnic-spacing-stack-xs + $unnnic-font-size-body-gt +
        $unnnic-line-height-md;
    }

    .unnecessary-card {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    .buttons {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-xs;
    }

    button {
      width: 100%;
    }

    div {
      p {
        margin: 0;
      }
    }

    &__paid {
      span {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &__custom {
      &__access-code {
        text-decoration: underline;
        cursor: pointer;
      }

      > div {
        button:first-child {
          margin-bottom: $unnnic-spacing-stack-xs;
        }
      }

      &__form {
        display: flex;
        flex-direction: column;

        > div:last-child {
          display: flex;
          margin-top: $unnnic-spacing-stack-md;

          button:first-child {
            margin-right: $unnnic-spacing-stack-sm;
          }
        }
      }
    }
  }

  .show-more {
    margin-top: $unnnic-spacing-stack-xs;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-stack-xs;
    cursor: pointer;
    user-select: none;
    width: max-content;
  }

  @media screen and (max-width: 1150px) {
    .billing-switch {
      align-items: flex-start;
    }
  }
}
</style>
