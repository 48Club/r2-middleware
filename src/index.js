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

		let sig = url.searchParams.get('sig');
		let file = url.searchParams.get('file');
		let msg = {
			file: url.searchParams.get('file'),
			tt: parseInt(url.searchParams.get('tt')),
		}

		if (msg.tt < Date.now() / 1000) {
			return new Response('Token is expired.', { status: 400 });
		}

		const recoveredAddress = ethers.verifyMessage(JSON.stringify(msg), sig);

		if (!(await checkUserSP(recoveredAddress))) {
			// 用户 SP 不足
			return new Response('Need more than 48 SoulPoint.', { status: 400 });
		}

		const object = await env.R2.get(file, {
			range: request.headers,
			onlyIf: request.headers,
		})

		if (!object) {
			return new Response('Not Found', { status: 404 });
		}

		const headers = new Headers()
		object.writeHttpMetadata(headers)
		headers.set('etag', object.httpEtag)
		if (object.range) {
			headers.set("content-range", `bytes ${object.range.offset}-${object.range.end ?? object.size - 1}/${object.size}`)
		}

		const status = object.body ? (request.headers.get("range") !== null ? 206 : 200) : 304
		return new Response(object.body, {
			headers,
			status
		})
	},
};
