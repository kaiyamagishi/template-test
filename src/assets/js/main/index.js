import Vue from 'vue'

import layoutDefault from '../../vue/common/layoutDefault.vue'
import testCard from '../../vue/common/testCard.vue'


let vue;
window.onload = () => {
	vue = createVue();

};

const createVue = () => {

	return new Vue({
		el: '#index-vue',
		data: {
			pageInformation: {
				title: 'トップページ',
				description: 'ページの説明',
				// ページ用にorg画像を入れたい場合はこっち
				// 空だったらlayoutDefault.vueに書いてあるやつ
				pageOrgImg: 'assets/img/page_org.png',
			}
		},
		created() {
		},
		components: {
			layoutDefault,
			testCard,
		},
		methods: {
		},
		computed: {
		},
		props: {
		},
		mounted() {
			console.log(JSON.stringify(this.pageInformation));
		},
	});
};



