MediaHandlers.youtube = Vue.extend({
    props: {
        bus: { type: Object },
        iconClass: {
            type: String,
            default: 'fab fa-youtube',
        },
    },

    computed: {
        dropdownItems: function() {
            return [
                {
                    text: 'Play',
                    icon: 'play',
                    action: this.play,
                },

                {
                    text: 'Download',
                    icon: 'download',
                    action: this.download,
                },

                {
                    text: 'View info',
                    icon: 'info',
                    action: this.info,
                },
            ];
        },
    },

    methods: {
        play: function(item) {
        },

        download: function(item) {
        },

        info: function(item) {
        },
    },
});
