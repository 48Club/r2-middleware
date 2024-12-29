/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ethers } from 'ethers'


export default {
	async fetch(request, env, ctx) {
		let provider = new ethers.JsonRpcProvider(env.CF_BSC_RPC)
		return new Response(JSON.stringify(await provider.getNetwork()), { status: 200 })
	},
};
