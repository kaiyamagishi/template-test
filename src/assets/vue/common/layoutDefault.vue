<template>
	<div class="container">
		<header>
			<div class="grid-container">
				<div class="grid-x grid-margin-x">
					<div class="large-12 cell">
						<h1>Welcome to Foundation for Sites</h1>
					</div>
				</div>
			</div>
		</header>
		<main>
			<slot></slot>
		</main>
		<footer>
			<p>(c)footer copyright</p>
		</footer>
	</div>
</template>

<script>
	import Vue from 'vue'
	import VueRouter from 'vue-router'
	import VueHead from 'vue-head'

	Vue.use(VueHead)
	Vue.use(VueRouter)

	export default {
		name: 'layout-default',
		data() {
			return {
				siteUrl : 'http://hoge.jp/',
				basicOrgImg: 'assets/img/org.png',
				orgImg : "",
			}
		},
		head: {
			title() {
				return {
					inner: this.information.title,
					separator: '|',
					complement: 'サイト名',
				}
			},
			meta() {
				return [
					{ n: 'viewport', c: 'width=device-width, initial-scale=1.0' },
					// applicationなら追加
					{ name: 'application-name', content: 'アプリケーション名' },
					{ name: 'description', content: this.information.title },
					// Twitter / with shorthand
					{ name: 'twitter:title', content: this.information.title },
					{ n: 'twitter:description', c: this.information.description },
					// Google+ / Schema.org
					{ itemprop: 'name', content: this.information.title },
					{ itemprop: 'description', content: this.information.description },
					// Facebook / Open Graph
					{ property: 'fb:app_id', content: '123456789' },
					{ property: 'og:title', content: this.information.title },
					{ p: 'og:image', c: this.orgImg },
				]
			},
			link() {
				return [
					{ r: 'icon', h: '/assets/img/icon-16.png', sz: '16x16', t: 'image/png' },
					{ r: 'stylesheet', h: '/assets/css/app.css' },
				]
			}
		},
		created() {
			if(this.information.pageOrgImg) {
				this.orgImg = this.siteUrl + this.information.pageOrgImg;
			} else {
				this.orgImg = this.siteUrl + this.basicOrgImg;
			}
		},
		// props: ['state', 'article']
		// or ↓
		props: {
			information:{},
		computed: {
		},
		},
		methods: {
		},
		mounted() {
			console.log(JSON.stringify(this.basicOrgImg));
		},
	}
</script>
