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

let provider = new ethers.JsonRpcProvider('https://0.48.club')

const spAbi = [
	"function getPoint(address) public view returns (uint256)"
];

const spContract = new ethers.Contract("0x928dC5e31de14114f1486c756C30f39Ab9578A92", spAbi, provider);

const minAllowPoint = BigInt(48);

async function checkUserSP(address) {
	return await spContract.getPoint(address) >= minAllowPoint;
}

function errorCode400() {
	return new Response('R U OK?', { status: 400 });
}

export default {
	async fetch(request, env, ctx) {
		let url = new URL(request.url);
		if (url.searchParams.size !== 3 || url.pathname !== '/') {
			return errorCode400();
		}

		console.log(url.searchParams.size);
		let sig = url.searchParams.get('sig');
		let msg = JSON.stringify({
			file: url.searchParams.get('file'),
			tt: url.searchParams.get('tt'),
		})
		console.log(msg);


		// @TODO: 验证签名
		if (!sig) {
			// 签名不合规
			return errorCode400();
		}

		if (!(await checkUserSP('0x34a02F8706d8859F5cDd4a7620F26E12Ef23D168'))) {
			// 用户 SP 不足
			return errorCode400();
		}

		// 返回用户请求的 $file 的内容
		return new Response("xixi~", { status: 200 })
	},
};
