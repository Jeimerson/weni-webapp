<template>
  <img :src="currentEmote" :title="name" />
</template>

<script>
export default {
  props: {
    name: {
      type: String,
    },
  },

  computed: {
    currentEmote() {
      const codes = {
        'Winking Face': 'u1F609',
        'Smiling Face with Smiling Eyes': 'u1F645',
      };

      return require(`../assets/emoji/${codes[this.name]}.png`);
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  height: 1em;
  user-select: none;
  margin-bottom: -0.05em;
}
</style>
